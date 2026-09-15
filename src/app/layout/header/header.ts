import { Component, HostListener, computed, inject } from '@angular/core';
import { Router ,RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  menuOpen = false;
  readonly authService = inject(AuthService);
  private router = inject(Router);

  readonly userInitials = computed(() => {
    const user = this.authService.currentUser();

    if (user?.is_anonymous) {
      return  'G';
    }
    const name = user?.user_metadata?.['name'];
    if (name) {
      return name.trim().split(/\s+/).map((part: string) => part[0])
      .slice(0, 2).join('').toUpperCase();
      }
      return user?.email?.charAt(0).toUpperCase() ?? '';
  });

toggleMenu(event: MouseEvent): void {
  event.stopPropagation();
  this.menuOpen = !this.menuOpen;
}

@HostListener('document:click')
closeMenu(): void {
  this.menuOpen = false;
}

async logout(): Promise<void> {
  const { error } = await this.authService.logout();

  if (error) {
    console.error('Logout is fail:', error);
    return;
  }
  this.menuOpen = false;
  await this.router.navigate(['/log-in']);
}
}
