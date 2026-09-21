import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
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
    private readonly signupDraftKey = 'signupDraft';


    authForm!: FormGroup;
    submitted = false;
    passwordVisible = false;
    confirmPasswordVisible = false;



    /**
     * Initializes the authentication form based on the current mode (login or signup).
     * Restores signup draft data and saves changes to session storage for signup mode.
     */
    ngOnInit(): void {
        this.authForm =
            this.mode === 'signup' ? this.createSignupForm() : this.createLoginForm();
        if (this.isSignup) {
            this.restoreSignupDraft();
            this.authForm.valueChanges.subscribe(() => {
                this.saveSignupDraft();
            });
        }
    }



    /**
     * Creates and returns a form group for login with email and password fields.
     * @returns A FormGroup configured for login validation.
     */
    private createLoginForm(): FormGroup {
        return new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email,]),
            password: new FormControl('', [Validators.required]),
        });
    }



    /**
     * Creates and returns a form group for signup with name, email, password,
     * confirm password, and privacy policy acceptance fields.
     * Includes a custom validator to ensure passwords match.
     * @returns A FormGroup configured for signup validation.
     */
    private createSignupForm(): FormGroup {
        return new FormGroup({
            name: new FormControl('', [Validators.required, Validators.pattern(/\S/)]),
            email: new FormControl('', [Validators.required, Validators.email,]),
            password: new FormControl('', [Validators.required, Validators.minLength(6),]),
            confirmPassword: new FormControl('', Validators.required),
            privacy: new FormControl(false, Validators.requiredTrue),
        }, { validators: this.passwordsMatch }
        );
    }



    /**
     * Custom validator that checks whether the password and confirm password fields match.
     * @param form - The abstract control containing the password fields.
     * @returns null if passwords match, or a passwordsMismatch error object otherwise.
     */
    private passwordsMatch(
        form: AbstractControl): ValidationErrors | null {
        const password = form.get('password')?.value;
        const confirmation = form.get('confirmPassword')?.value;
        return password === confirmation ? null : { passwordsMismatch: true };
    }



    /**
     * Toggles the visibility of the password input field.
     */
    togglePasswordVisibility(): void {
        this.passwordVisible = !this.passwordVisible;
    }



    /**
     * Toggles the visibility of the confirm password input field.
     */
    toggleConfirmPasswordVisibility(): void {
        this.confirmPasswordVisible = !this.confirmPasswordVisible;
    }



    /**
     * Sets a wrong password error on the form and marks the password field as touched.
     * Used to display invalid credentials after a failed login attempt.
     */
    setWrongPasswordError(): void {
        this.authForm.setErrors({ wrongPassword: true });
        this.password?.markAsTouched();
    }



    /**
     * Handles form submission by marking the form as submitted and validating all fields.
     * Emits the form values if the form is valid; otherwise marks all fields as touched.
     */
    submit(): void {
        this.submitted = true;
        if (this.authForm.invalid) {
            this.authForm.markAllAsTouched();
            return;
        }
        this.formSubmit.emit(this.authForm.getRawValue());
    }



    /**
     * Getter for the email form control.
     * @returns The email FormControl or null if not found.
     */
    get email() {
        return this.authForm.get('email');
    }



    /**
     * Getter for the password form control.
     * @returns The password FormControl or null if not found.
     */
    get password() {
        return this.authForm.get('password');
    }



    /**
     * Checks whether the current authentication mode is signup.
     * @returns True if the mode is 'signup', false otherwise.
     */
    get isSignup(): boolean {
        return this.mode === 'signup';
    }



    /**
     * Saves the current signup form values (name, email, privacy) to session storage.
     * Used to restore draft data if the user navigates away and returns.
     */
    private saveSignupDraft(): void {
        const { name, email, privacy } = this.authForm.getRawValue();


        sessionStorage.setItem(
            this.signupDraftKey,
            JSON.stringify({ name, email, privacy })
        );
    }



    /**
     * Restores previously saved signup draft data from session storage.
     * Patches the form with the stored values without emitting value change events.
     */
    private restoreSignupDraft(): void {
        const draft = sessionStorage.getItem(this.signupDraftKey);
        if (!draft) return;
        this.authForm.patchValue(JSON.parse(draft), {
            emitEvent: false,
        });
    }
}