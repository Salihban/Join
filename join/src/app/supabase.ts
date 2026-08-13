import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

export interface Contact {
    id: string;
    name: string;
    initials: string;
    email: string;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})
export class Supabase {
    supabaseUrl = 'https://mbifznamhyihpgduvqru.supabase.co';
    supabaseKey = 'sb_publishable_JUaeWi8_jhlIrDYKFIr-HQ_ZPNiPis2';

    supabase = createClient(this.supabaseUrl, this.supabaseKey);
    contacts = signal<Contact[]>([]);

    async getContacts() {
        const { data: contacts, error } = await this.supabase
            .from('contacts')
            .select('id, name, initials, email, phone');

        if (error) {
            console.error('Fehler beim Laden', error);
            return;
        }

        if (!contacts) return;
        this.contacts.set(contacts);
    }
}