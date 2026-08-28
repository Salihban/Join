import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Aside } from './layout/aside/aside';
import { Header } from './layout/header/header';
import { Board } from "./pages/board/board";



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Aside, Board],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {
  protected readonly title = signal('join');
}