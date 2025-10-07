import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBuildingOffice2Solid,
  heroUserPlusSolid,
  heroEnvelopeOpenSolid,
  heroUsersSolid,
  heroArrowPathSolid,
  heroCheckCircleSolid,
  heroShieldCheckSolid,
  heroSparklesSolid,
} from '@ng-icons/heroicons/solid';
import { InputComponent } from '../../components/ui/input/input';
import { ButtonComponent } from '../../components/ui/button/button';
import { SelectComponent, SelectOption } from '../../components/ui/select/select';
import { AuthService } from '../../services/auth.service';
import { toast } from 'ngx-sonner';

type MemberRole = 'admin' | 'member';

type MemberRoleDisplay = MemberRole | 'owner';

interface ActiveOrganization {
  id: string;
  name: string;
  slug?: string;
  logo?: string | null;
  metadata?: Record<string, any>;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: unknown;
}

interface OrganizationMember {
  id: string;
  userId: string;
  role: MemberRoleDisplay;
  createdAt?: string | Date;
  organizationId?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
  [key: string]: unknown;
}

interface OrganizationInvitation {
  id: string;
  email: string;
  role: MemberRoleDisplay;
  status?: string;
  createdAt?: string | Date;
  expiresAt?: string | Date;
  organizationId?: string;
  [key: string]: unknown;
}

type AtomResult<T> = {
  data?: T | null;
  error?: {
    message?: string;
  } | null;
} | null;

type SessionPayload = {
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
  session: {
    activeOrganizationId?: string | null;
  };
};

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    NgIcon,
  ],
  providers: [
    provideIcons({
      heroBuildingOffice2Solid,
      heroUserPlusSolid,
      heroEnvelopeOpenSolid,
      heroUsersSolid,
      heroArrowPathSolid,
      heroCheckCircleSolid,
      heroShieldCheckSolid,
      heroSparklesSolid,
    }),
  ],
  templateUrl: './organization.html',
})
export class Organization implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  activeOrganization = signal<ActiveOrganization | null>(null);
  organizationLoading = signal(false);
  members = signal<OrganizationMember[]>([]);
  membersTotal = signal(0);
  membersLoading = signal(false);
  invitations = signal<OrganizationInvitation[]>([]);
  invitationsLoading = signal(false);
  isUpdatingOrganization = signal(false);
  isInvitingMember = signal(false);
  currentUserId = signal<string | null>(null);

  pendingInvitations = computed(() => {
    return this.invitations().filter(
      (invitation) => !invitation.status || invitation.status.toLowerCase() === 'pending'
    );
  });

  private sessionUnsubscribe?: () => void;
  private organizationUnsubscribe?: () => void;
  private lastLoadedOrganizationId: string | null = null;
  private organizationErrorDisplayed = false;

  updateOrganizationForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    slug: ['', [Validators.required, Validators.minLength(2)]],
    logo: [''],
  });

  inviteMemberForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['member' as MemberRole, [Validators.required]],
  });

  readonly roleOptions: SelectOption[] = [
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ];

  readonly memberRoleOptions: SelectOption[] = [
    { label: 'Owner', value: 'owner', disabled: true },
    { label: 'Admin', value: 'admin' },
    { label: 'Member', value: 'member' },
  ];

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.sessionUnsubscribe?.();
      this.organizationUnsubscribe?.();
    });
  }

  ngOnInit(): void {
    this.observeSession();
    this.observeActiveOrganization();
  }

  private observeSession(): void {
    const sessionAtom = this.authService.useSession();
    this.sessionUnsubscribe?.();
    this.sessionUnsubscribe = sessionAtom.subscribe((session: AtomResult<SessionPayload>) => {
      const sessionData = session?.data;
      if (!sessionData) {
        this.currentUserId.set(null);
        return;
      }
      this.currentUserId.set(sessionData.user.id);
    });
  }

  private observeActiveOrganization(): void {
    this.organizationLoading.set(true);
    const organizationAtom = this.authService.getActiveOrganization();
    this.organizationUnsubscribe?.();
    this.organizationUnsubscribe = organizationAtom.subscribe((response) => {
      this.organizationLoading.set(false);

      if (response?.error && !response.data && !this.organizationErrorDisplayed) {
        toast.error(response.error?.message ?? 'Unable to load active organization.');
        this.organizationErrorDisplayed = true;
      }

      const organization = response?.data ?? null;

      if (!organization) {
        this.activeOrganization.set(null);
        this.members.set([]);
        this.membersTotal.set(0);
        this.invitations.set([]);
        this.lastLoadedOrganizationId = null;
        return;
      }

      this.organizationErrorDisplayed = false;
      this.activeOrganization.set(organization);
      this.updateOrganizationForm.patchValue({
        name: organization.name ?? '',
        slug: organization.slug ?? '',
        logo: organization.logo ?? '',
      });

      if (organization.id && organization.id !== this.lastLoadedOrganizationId) {
        this.lastLoadedOrganizationId = organization.id;
        void this.loadMembers(organization.id);
        void this.loadInvitations(organization.id);
      }
    });
  }

  async onUpdateOrganization(): Promise<void> {
    if (this.updateOrganizationForm.invalid) {
      this.updateOrganizationForm.markAllAsTouched();
      return;
    }
    const organization = this.activeOrganization();
    if (!organization?.id) {
      return;
    }
    this.isUpdatingOrganization.set(true);
    try {
      const { name, slug, logo } = this.updateOrganizationForm.getRawValue();
      const result = await this.authService.updateOrganization(
        organization.id,
        name,
        slug,
        logo || undefined
      );
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error updating organization');
      }
      this.activeOrganization.update((current) => {
        if (!current) {
          return current;
        }
        return {
          ...current,
          name,
          slug,
          logo,
        };
      });
      toast.success('Organization updated successfully');
    } catch (error: any) {
      toast.error(error?.message ?? 'Error updating organization');
    } finally {
      this.isUpdatingOrganization.set(false);
    }
  }

  async onInviteMember(): Promise<void> {
    if (this.inviteMemberForm.invalid) {
      this.inviteMemberForm.markAllAsTouched();
      return;
    }
    const organization = this.activeOrganization();
    if (!organization?.id) {
      return;
    }
    this.isInvitingMember.set(true);
    try {
      const { email, role } = this.inviteMemberForm.getRawValue();
      const result = await this.authService.inviteUserToOrganization(organization.id, email, role);
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error sending invite');
      }
      toast.success('Invite sent successfully');
      this.inviteMemberForm.reset({ email: '', role: 'member' });
      await this.loadInvitations(organization.id);
    } catch (error: any) {
      toast.error(error?.message ?? 'Error sending invite');
    } finally {
      this.isInvitingMember.set(false);
    }
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    const organization = this.activeOrganization();
    if (!organization?.id) {
      return;
    }
    try {
      const result = await this.authService.cancelInvitation(invitationId);
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error canceling invite');
      }
      toast.success('Invite canceled');
      this.invitations.update((current) => current.filter((inv) => inv.id !== invitationId));
    } catch (error: any) {
      toast.error(error?.message ?? 'Error canceling invite');
    }
  }

  async removeMember(member: OrganizationMember): Promise<void> {
    const organization = this.activeOrganization();
    if (!organization?.id) {
      return;
    }
    if (member.userId === this.currentUserId()) {
      toast.error('You cannot remove yourself.');
      return;
    }
    if (member.role === 'owner') {
      toast.error('Cannot remove the owner.');
      return;
    }
    try {
      const identifier = member.user?.email ?? member.id;
      const result = await this.authService.removeMember(organization.id, identifier);
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error removing member');
      }
      toast.success('Member removed');
      this.members.update((current) => current.filter((m) => m.id !== member.id));
      this.membersTotal.update((total) => Math.max(0, total - 1));
    } catch (error: any) {
      toast.error(error?.message ?? 'Error removing member');
    }
  }

  async updateMemberRole(member: OrganizationMember, role: MemberRole): Promise<void> {
    const organization = this.activeOrganization();
    if (!organization?.id || member.role === role || member.role === 'owner') {
      return;
    }
    try {
      const result = await this.authService.updateMemberRole(organization.id, member.id, role);
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error updating role');
      }
      toast.success('Role updated');
      this.members.update((current) =>
        current.map((m) => (m.id === member.id ? { ...m, role } : m))
      );
    } catch (error: any) {
      toast.error(error?.message ?? 'Error updating role');
    }
  }

  async refreshData(): Promise<void> {
    const organization = this.activeOrganization();
    if (!organization?.id) {
      return;
    }
    await Promise.all([this.loadMembers(organization.id), this.loadInvitations(organization.id)]);
  }

  private async loadMembers(organizationId: string): Promise<void> {
    this.membersLoading.set(true);
    try {
      const result = await this.authService.listMembers(organizationId);
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error loading members');
      }

      let payload = (result as any)?.data ?? (result as any)?.response ?? result;

      if (payload?.data && typeof payload.data === 'object') {
        payload = payload.data;
      }

      const members: OrganizationMember[] = Array.isArray(payload?.members)
        ? payload.members
        : Array.isArray(payload)
        ? payload
        : [];
      const total = typeof payload?.total === 'number' ? payload.total : members.length;
      this.members.set(members);
      this.membersTotal.set(total);
    } catch (error: any) {
      toast.error(error?.message ?? 'Error loading members');
      this.members.set([]);
      this.membersTotal.set(0);
    } finally {
      this.membersLoading.set(false);
    }
  }

  private async loadInvitations(organizationId: string): Promise<void> {
    this.invitationsLoading.set(true);
    try {
      const result = await this.authService.listInvitations();
      if ((result as any)?.error) {
        throw new Error((result as any).error.message ?? 'Error loading invitations');
      }
      const payload = (result as any)?.data ?? (result as any)?.response ?? result;
      let invitations: OrganizationInvitation[] = [];
      if (Array.isArray(payload)) {
        invitations = payload as OrganizationInvitation[];
      } else if (Array.isArray(payload?.invitations)) {
        invitations = payload.invitations as OrganizationInvitation[];
      } else if (Array.isArray(payload?.data)) {
        invitations = payload.data as OrganizationInvitation[];
      }
      invitations = invitations.filter((invitation) =>
        invitation.organizationId ? invitation.organizationId === organizationId : true
      );
      this.invitations.set(invitations);
    } catch (error: any) {
      toast.error(error?.message ?? 'Error loading invitations');
      this.invitations.set([]);
    } finally {
      this.invitationsLoading.set(false);
    }
  }

  getInitials(name?: string): string {
    if (!name) {
      return '';
    }
    return name
      .split(' ')
      .filter((part) => part)
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  formatDate(value?: string | Date): string {
    if (!value) {
      return '';
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  invitationStatusLabel(status?: string): string {
    if (!status) {
      return 'Pending';
    }
    const normalized = status.toLowerCase();
    if (normalized === 'accepted') {
      return 'Accepted';
    }
    if (normalized === 'rejected') {
      return 'Rejected';
    }
    if (normalized === 'cancelled' || normalized === 'canceled') {
      return 'Canceled';
    }
    return 'Pending';
  }
}
