import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './aside.html',
  styleUrl: './aside.scss',
})
export class Aside {}
