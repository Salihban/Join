import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from './layout/aside/aside';
import { Header } from './layout/header/header';
import { TaskForm } from './components/task-form/task-form';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Aside, TaskForm],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}