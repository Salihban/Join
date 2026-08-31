import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from './layout/aside/aside';
import { Header } from './layout/header/header';
import { TaskCard } from './components/task-card/task-card';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Aside, TaskCard],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}