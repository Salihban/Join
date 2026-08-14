import { Component, signal } from '@angular/core';
import { ContactList } from './components/contact-list/contact-list';
import { RouterOutlet } from '@angular/router';
import { LegalNotice } from './pages/legal-notice/legal-notice';
import { PrivacyPolicy } from "./pages/privacy-policy/privacy-policy";
import { Help } from "./pages/help/help";
import { ContactDialog } from './components/contact-dialog/contact-dialog';
import { Aside } from './layout/aside/aside';
import { Header } from './layout/header/header';
import { ContactInfo } from './components/contact-info/contact-info';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ContactList, Aside, LegalNotice, PrivacyPolicy, Help, ContactInfo],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}