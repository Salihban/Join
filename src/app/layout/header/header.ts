import { Component, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = false;

toggleMenu(event: MouseEvent): void {
  event.stopPropagation();
  this.menuOpen = !this.menuOpen;
}

@HostListener('document:click')
closeMenu(): void {
  this.menuOpen = false;
}

logout(): void {
  console.log('Logout');
}
}
