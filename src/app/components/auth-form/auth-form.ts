import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule,
        ValidationErrors, Validators} from '@angular/forms';
import { RouterLink } from '@angular/router';

export type AuthMode = 'login' | 'signup';

export interface AuthFormValue {
    name?: string;
    email: string;
    password: string;
    confirmPassword?: string;
    privacy?: boolean;
}

@Component({
selector: 'app-auth-form',
standalone: true,
imports: [CommonModule, ReactiveFormsModule, RouterLink],
templateUrl: './auth-form.html',
styleUrl: './auth-form.scss',
})
export class AuthForm implements OnInit {
@Input() mode: AuthMode = 'login';
@Output() formSubmit = new EventEmitter<AuthFormValue>();
@Output() guestSubmit = new EventEmitter<void>();

authForm!: FormGroup;
submitted = false;
passwordVisible = false;

ngOnInit(): void {
    this.authForm = 
    this.mode === 'signup'? this.createSignupForm(): this.createLoginForm();
}

private createLoginForm(): FormGroup {
return new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email,]),
    password: new FormControl('', [Validators.required,Validators.minLength(6),]),
    });
}

private createSignupForm(): FormGroup {
return new FormGroup({
        name: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email,]),
        password: new FormControl('', [Validators.required, Validators.minLength(6),]),
        confirmPassword: new FormControl('', Validators.required),
        privacy: new FormControl(false, Validators.requiredTrue),
    }, { validators: this.passwordsMatch }
    );
}

private passwordsMatch(
    form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmation = form.get('confirmPassword')?.value;
    return password === confirmation? null: { passwordsMismatch: true };
    }

togglePasswordVisibility(): void {
    if (this.password?.value) {
    this.passwordVisible = !this.passwordVisible;
    }
}

submit(): void {
    this.submitted = true;
    if (this.authForm.invalid) {
    this.authForm.markAllAsTouched();
    return;
    }
    this.formSubmit.emit(this.authForm.getRawValue());
}

get email() {
    return this.authForm.get('email');
}

get password() {
    return this.authForm.get('password');
}

get isSignup(): boolean {
    return this.mode === 'signup';
    }
}