import { Injectable } from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authClient = createAuthClient({
    baseURL: 'http://localhost:4000',
    basePath: '/auth',
    plugins: [organizationClient()],
  });

  signIn(email: string, password: string) {
    return this.authClient.signIn.email({ email, password });
  }

  async signUpWithOrganization(
    email: string,
    password: string,
    name: string,
    organizationName: string
  ) {
    const user = await this.authClient.signUp.email({ email, password, name });
    const organization = await this.authClient.organization.create({
      name: organizationName,
      slug: organizationName.toLowerCase().replace(/ /g, '-'),
      userId: user.data?.user.id,
    });
    return {
      user,
      organization,
    };
  }

  setActiveOrganization(organizationId: string) {
    return this.authClient.organization.setActive({ organizationId });
  }

  signOut() {
    return this.authClient.signOut();
  }

  getSession() {
    return this.authClient.getSession();
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
  }

  updateUser(name: string, image: string) {
    return this.authClient.updateUser({ name, image });
  }

  revokeSession(token: string) {
    return this.authClient.revokeSession({ token });
  }

  getSessions() {
    const sessions = this.authClient.listSessions();
    return sessions;
  }

  listOrganizations() {
    return this.authClient.organization.list();
  }

  inviteUserToOrganization(organizationId: string, email: string, role: 'member' | 'admin') {
    return this.authClient.organization.inviteMember({
      email,
      role,
      organizationId,
      resend: true,
    });
  }

  acceptInvitation(invitationId: string) {
    return this.authClient.organization.acceptInvitation({
      invitationId,
    });
  }

  cancelInvitation(invitationId: string) {
    return this.authClient.organization.cancelInvitation({
      invitationId,
    });
  }

  rejectInvitation(invitationId: string) {
    return this.authClient.organization.rejectInvitation({
      invitationId,
    });
  }

  getInvitation(id: string) {
    return this.authClient.organization.getInvitation({
      query: {
        id,
      },
    });
  }

  listInvitations() {
    return this.authClient.organization.listInvitations();
  }

  listUserInvitations() {
    return this.authClient.organization.listUserInvitations();
  }

  listMembers(
    organizationId: string,
    limit: number,
    offset: number,
    sortBy: string,
    sortDirection: 'asc' | 'desc',
    filterField: string,
    filterOperator: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte' | 'contains',
    filterValue: string
  ) {
    return this.authClient.organization.listMembers({
      query: {
        organizationId,
        limit,
        offset,
        sortBy,
        sortDirection,
        filterField,
        filterOperator,
        filterValue,
      },
    });
  }

  removeMember(organizationId: string, memberIdOrEmail: string) {
    return this.authClient.organization.removeMember({
      memberIdOrEmail,
      organizationId,
    });
  }

  updateMemberRole(organizationId: string, memberId: string, role: 'admin' | 'member') {
    return this.authClient.organization.updateMemberRole({
      role,
      memberId,
      organizationId,
    });
  }

  updateOrganization(organizationId: string, name: string, slug: string, logo?: string) {
    return this.authClient.organization.update({
      data: {
        name,
        slug,
        logo,
      },
      organizationId,
    });
  }

  hasPermission(organizationId: string, permission: {}) {
    return this.authClient.organization.hasPermission({
      organizationId,
      permission,
    });
  }
}
