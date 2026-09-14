import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthForm, AuthFormValue} from '../../components/auth-form/auth-form';
import { AuthService } from '../../services/auth';

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

async signUp(value: AuthFormValue): Promise<void> {
    if (!value.name) return;

    const { data, error } = await this.authService.signUp(
    value.name,
    value.email,
    value.password
    );

    if (error) {
    console.error('Registrierung fehlgeschlagen:', error);
    return;
    }

    if (data.session) {
        await this.router.navigate(['/summary']);
    } else {
        await this.router.navigate(['/log-in']);
    }
}
}