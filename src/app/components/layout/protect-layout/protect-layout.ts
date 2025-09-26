import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';

@Component({
  selector: 'app-protect-layout',
  imports: [RouterOutlet, Header],
  templateUrl: './protect-layout.html',
  styles: ``,
})
export class ProtectLayout {}
