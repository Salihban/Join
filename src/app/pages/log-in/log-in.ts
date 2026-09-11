import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-log-in',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
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