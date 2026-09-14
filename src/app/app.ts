import { Component, signal, inject } from '@angular/core';
import { Router ,RouterOutlet } from '@angular/router';
import { Aside } from './layout/aside/aside';
import { Header } from './layout/header/header';
import { ContactService } from './services/contact';
import { Summary } from './pages/summary/summary';
import { LogIn } from './pages/log-in/log-in';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Aside, Summary],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
  public router = inject(Router);
  public contactService = inject(ContactService);
}