import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthForm, AuthFormValue } from '../../components/auth-form/auth-form';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-log-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, AuthForm, RouterLink],
    styleUrl: './log-in.scss',
    templateUrl: './log-in.html',
})
export class LogIn {
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    generalError: string = '';
    submitted: boolean = false;
    passwordVisible: boolean = false;
    private authService = inject(AuthService);
    private router = inject(Router);

    ngAfterViewInit(): void { 
        requestAnimationFrame(() => { this.setIntroLogoTarget(); }); 
    }

    private setIntroLogoTarget(): void {
        const loginLogo = document.querySelector('.login-header .logo-icon') as HTMLElement | null; 
        const introLogo = document.querySelector('.intro-logo') as HTMLElement | null; 
        if (!loginLogo || !introLogo) { return; } const logoRect = loginLogo.getBoundingClientRect(); 
        introLogo.style.setProperty('--logo-target-left', `${logoRect.left}px`); 
        introLogo.style.setProperty('--logo-target-top', `${logoRect.top}px`); 
        introLogo.style.setProperty('--logo-target-width', `${logoRect.width}px`);
    }
    
    async login(value: AuthFormValue): Promise<void> {
        const { error } = await this.authService.login(value.email, value.password);
        if (error) {
            this.generalError = error.message;
            return;
        }
        await this.router.navigate(['/board']);
    }

    async guestLogin(): Promise<void> {
        const { error } = await this.authService.guestLogin();
        if (error) {
            return;
        }
        await this.router.navigate(['/board']);
    }

    get email() { return this.loginForm.get('email'); }
    get password() { return this.loginForm.get('password'); }

    togglePasswordVisibility() {
        const passwordValue = this.password?.value;
        if (passwordValue && passwordValue.length > 0) {
            this.passwordVisible = !this.passwordVisible;
        }
    }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.generalError = '';
    }
}