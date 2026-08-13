import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = false;

toggleMenu(): void {
  this.menuOpen = !this.menuOpen;
}

logout(): void {
  console.log('Logout');
}
}
