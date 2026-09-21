import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Supabase } from './supabase';
import { CanActivateFn, Router } from '@angular/router';


@Injectable({ providedIn: 'root'})
export class AuthService {
private readonly dbService = inject(Supabase);


readonly currentUser = signal<User | null>(null);
readonly isLoggedIn = computed(() => this.currentUser() !== null);



    /**
     * Initializes the auth service by restoring the existing session and setting up auth state change listeners.
     * @returns void
     */
    constructor() {
        this.restoreSession();
        this.watchAuthChanges();
    }



    /**
     * Signs in a user anonymously as a guest.
     * @returns A promise resolving to the Supabase auth response.
     */
    async guestLogin() {
        return this.dbService.supabase.auth.signInAnonymously();
    }



    /**
     * Registers a new user with name, email, and password.
     * @param name - The user's display name.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A promise resolving to the Supabase auth response.
     */
    async signUp(name: string, email: string, password: string) {
        return this.dbService.supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name },
            },
        });
    }



    /**
     * Logs in an existing user with email and password.
     * @param email - The user's email address.
     * @param password - The user's password.
     * @returns A promise resolving to the Supabase auth response.
     */
    async login(email: string, password: string) {
        return this.dbService.supabase.auth.signInWithPassword({
            email,
            password,
        });
    }



    /**
     * Logs out the current user and clears the local user state.
     * @returns A promise resolving to the Supabase auth response.
     */
    async logout() {
        const result = await this.dbService.supabase.auth.signOut();
        if (!result.error) {
            this.currentUser.set(null);
        }
        return result;
    }



    /**
     * Restores the user session from Supabase on service initialization.
     * @returns void
     */
    private async restoreSession(): Promise<void> {
        const { data } = await this.dbService.supabase.auth.getSession();
        this.currentUser.set(data.session?.user ?? null);
    }



    /**
     * Sets up a listener to track authentication state changes and update the current user signal.
     * @returns void
     */
    private watchAuthChanges(): void {
        this.dbService.supabase.auth.onAuthStateChange((_event, session) => {
            this.currentUser.set(session?.user ?? null);
        });
    }



    /**
     * Checks whether the user currently has an active session.
     * @returns A promise resolving to true if a session exists, false otherwise.
     */
    async hasSession(): Promise<boolean> {
        const { data } = await this.dbService.supabase.auth.getSession();
        return data.session !== null;
    }
}



/**
 * Route guard that checks whether the user has an active session.
 * Redirects to the login page if no session exists.
 * @returns true if the user has a session, or a UrlTree to the login page otherwise.
 */
export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return await authService.hasSession() ? true : router.createUrlTree(['/log-in']);
}