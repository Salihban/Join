import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from "./pages/privacy-policy/privacy-policy";
import { Help } from "./pages/help/help";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LegalNotice, PrivacyPolicy, Help],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}
