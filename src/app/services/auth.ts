import { computed, inject, Injectable, signal } from '@angular/core';
import { User } from '@supabase/supabase-js';
import { Supabase } from './supabase';

@Injectable({ providedIn: 'root'})
export class AuthService {
private readonly dbService = inject(Supabase);

readonly currentUser = signal<User | null>(null);
readonly isLoggedIn = computed(() => this.currentUser() !== null);

    constructor() {
    this.restoreSession();
    this.watchAuthChanges();
    }

async signUp(name: string, email: string, password: string) {
    return this.dbService.supabase.auth.signUp({
    email,
    password,
    options: {
        data: { name },
        },
    });
}

async login(email: string, password: string) {
    return this.dbService.supabase.auth.signInWithPassword({
    email,
    password,
    });
}

async logout() {
    const result = await this.dbService.supabase.auth.signOut();
    if (!result.error) {
    this.currentUser.set(null);
    }
    return result;
}

private async restoreSession(): Promise<void> {
    const { data } = await this.dbService.supabase.auth.getSession();
    this.currentUser.set(data.session?.user ?? null);
}

private watchAuthChanges(): void {
    this.dbService.supabase.auth.onAuthStateChange((_event, session) => {
    this.currentUser.set(session?.user ?? null);
    });
}
}