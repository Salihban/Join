import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthForm, AuthFormValue } from '../../components/auth-form/auth-form';
import { AuthService } from '../../services/auth';
import { ContactService } from '../../services/contact';

@Component({
    selector: 'app-sign-up',
    standalone: true,
    imports: [AuthForm],
    templateUrl: './sign-up.html',
    styleUrl: './sign-up.scss',
})
export class SignUp {
    private authService = inject(AuthService);
    private router = inject(Router);
    private contactService = inject(ContactService);

    @ViewChild(AuthForm) authFormComp!: AuthForm;

    async signUp(value: AuthFormValue): Promise<void> {
        if (!value.name) return;

        const { data, error } = await this.authService.signUp(
            value.name, value.email, value.password
        );

        if (error) {
            console.error('Registrierung fehlgeschlagen:', error);
            return;
        }

        if (this.authFormComp && this.authFormComp.authForm) {
            this.authFormComp.authForm.reset();
        }

        if (this.authFormComp) {
            this.authFormComp.clearDraft();
        }

        this.contactService.toastMessage.set('Sign up succesful');

        setTimeout(() => {
            this.contactService.toastMessage.set('');
        }, 3500);

        await this.authService.logout();
        await this.router.navigate(['/log-in']);
    }
}