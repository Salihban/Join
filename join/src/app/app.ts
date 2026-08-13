import { Component, signal } from '@angular/core';
import { ContactList } from './components/contact-list/contact-list';

@Component({
  selector: 'app-root',
  imports: [ContactList],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('join');
}