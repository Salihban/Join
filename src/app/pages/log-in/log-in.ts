import { Component, inject, ViewChild } from '@angular/core';
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
    @ViewChild(AuthForm) authFormComponent!: AuthForm;
    loginForm = new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
    });

    generalError: string = '';
    submitted: boolean = false;
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
            this.authFormComponent.setWrongPasswordError(); 
            return;
        }
        await this.router.navigate(['/summary']);
    }

    async guestLogin(): Promise<void> {
        const { error } = await this.authService.guestLogin();
        if (error) {
            return;
        }
        await this.router.navigate(['/summary']);
    }

    get email() { return this.loginForm.get('email'); }

    onSubmit() {
        this.submitted = true;

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.generalError = '';
    }
}