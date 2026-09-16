import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';


@Component({
    selector: 'app-log-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    styleUrl: './log-in.scss',
    templateUrl: './log-in.html',
})
export class LogIn {

    private authService = inject(AuthService);
    private router = inject(Router);

    loginForm = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),
        password: new FormControl('', [
            Validators.required,
            Validators.minLength(6)
        ])
    });

    generalError = '';
    submitted = false;
    passwordVisible = false;

    get email() {
        return this.loginForm.get('email');
    }

    get password() {
        return this.loginForm.get('password');
    }

    togglePasswordVisibility(): void {
        if (!this.password?.value) {
            return;
        }

        this.passwordVisible = !this.passwordVisible;
    }

    async onSubmit(value?: any): Promise<void> {
        this.submitted = true;
        this.generalError = '';

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const email = this.email?.value;
        const password = this.password?.value;

        if (!email || !password) {
            return;
        }

        const { error } = await this.authService.login(
            email,
            password
        );

        if (error) {
            this.generalError = error.message;
            return;
        }

        await this.router.navigate(['/summary']);
    }

    async guestLogin(): Promise<void> {
        this.generalError = '';

        const { error } = await this.authService.guestLogin();

        if (error) {
            this.generalError = error.message;
            return;
        }

        await this.router.navigate(['/summary']);
    }
}