import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContactDialog } from './components/contact-dialog/contact-dialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ContactDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}
