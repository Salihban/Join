import { Component, signal } from '@angular/core';
import { ContactList } from './components/contact-list/contact-list';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Aside } from './layout/aside/aside';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ContactList,  Aside],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}