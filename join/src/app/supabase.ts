import { computed, Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

export interface Contact {
    id: string;
    name: string;
    initials: string;
    email: string;
    phone: string;
}

export interface ContactGroup {
    letter: string;
    contacts: Contact[];
}

export interface NewContact {
    name: string;
    email: string;
    phone: string;
}

@Injectable({
    providedIn: 'root'
})

export class Supabase {
    readonly supabaseUrl: string = 'https://mbifznamhyihpgduvqru.supabase.co';
    readonly supabaseKey: string = 'sb_publishable_JUaeWi8_jhlIrDYKFIr-HQ_ZPNiPis2';
    readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);
    readonly contacts = signal<Contact[]>([]);
    readonly groupedContacts = computed<ContactGroup[]>(() => {
        const sortedContacts = [...this.contacts()].sort((a, b) =>
            a.name.localeCompare(b.name, 'de')
        );
        const groups: ContactGroup[] = [];

        for (const contact of sortedContacts) {
            const letter: string = contact.name.charAt(0).toUpperCase();

            let group = groups.find(group => group.letter === letter);

            if (!group) {
                group = {
                    letter: letter,
                    contacts: []
                };
                groups.push(group);
            }
            group.contacts.push(contact);
        }
        return groups;
    });

    async getContacts(): Promise<void> {
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


    async addContact(contact: NewContact): Promise<string | null> {
        const { error } = await this.supabase
            .from('contacts')
            .insert(contact);

        if (error) {
            console.error('Fehler beim Hinzufügen', error);
            return 'The contact could not be added. It may already exist or contain invalid characters';
        }
        await this.getContacts();
        return null;
    }
}