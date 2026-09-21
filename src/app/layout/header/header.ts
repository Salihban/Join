import { Component, HostListener, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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



  /**
   * Computes the user's initials for display in the header avatar.
   * Returns 'G' for anonymous users, the first two letters of the name if available,
   * or the first letter of the email address as a fallback.
   * @returns A string containing the user's initials or a default character.
   */
  readonly userInitials = computed(() => {
    const user = this.authService.currentUser();

    if (user?.is_anonymous) {
      return 'G';
    }
    const name = user?.user_metadata?.['name'];
    if (name) {
      return name.trim().split(/\s+/).map((part: string) => part[0])
        .slice(0, 2).join('').toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() ?? '';
  });



  /**
   * Toggles the user menu visibility and prevents event propagation.
   * @param event - The mouse event that triggered the menu toggle.
   * @returns void
   */
  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen = !this.menuOpen;
  }



  /**
   * Closes the user menu when clicking anywhere outside the component.
   * @returns void
   */
  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen = false;
  }



  /**
   * Logs out the current user and navigates to the login page.
   * Closes the menu and displays an error message if logout fails.
   * @returns void
   */
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