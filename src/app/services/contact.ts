import { computed, inject, Injectable, signal } from '@angular/core';
import { Supabase } from '../services/supabase';
import { AuthService } from './auth';



/**
 * Represents a contact entity with personal details and display properties.
 */
export interface Contact {
    id: string;
    name: string;
    initials: string;
    email: string;
    phone: string;
    color: string;
    auth_user_id?: string | null;
}



/**
 * Represents a group of contacts organized by the first letter of their names.
 */
export interface ContactGroup {
    letter: string;
    contacts: Contact[];
}



/**
 * Represents data for creating a new contact without system-generated fields.
 */
export interface NewContact {
    name: string;
    email: string;
    phone: string;
}



/**
 * Represents data for creating or updating a task.
 */
export interface NewTask {
    title: string;
    description: string;
    dueDate: string;
    priority: 'urgent' | 'medium' | 'low';
    category: string;
    assignedContactIds: Array<string | number>;
    subtasks: string[];
}


/**
 * Internal interface for inserting a contact, including generated initials and color.
 */
interface ContactInsert extends NewContact {
    initials: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})
export class ContactService {
    readonly contacts = signal<Contact[]>([]);
    readonly selectedContact = signal<Contact | null>(null);
    private authService = inject(AuthService);
    readonly contactColors = [
        '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
        '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
        '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B',
        '#FFE62B', '#FF4646'
    ];



    /**
     * Selects a contact by setting it as the selected contact after a brief delay.
     * @param contact - The contact to select.
     * @returns void
     */
    selectContact(contact: Contact): void {
        this.selectedContact.set(null);

        setTimeout(() => {
            this.selectedContact.set(contact);
        });
    }
    constructor(private readonly supabaseService: Supabase) { }



    /**
     * Computes contacts grouped alphabetically by the first letter of their names.
     * @returns An array of contact groups, each containing a letter and its associated contacts.
     */
    readonly groupedContacts = computed<ContactGroup[]>(() => {
        const sortedContacts = [...this.contacts()].sort((a, b) =>
            a.name.localeCompare(b.name, 'de')
        );

        const groups: ContactGroup[] = [];
        for (const contact of sortedContacts) {
            const letter = contact.name.charAt(0).toUpperCase();

            let group = groups.find(group => group.letter === letter);

            if (!group) {
                group = {
                    letter,
                    contacts: []
                };
                groups.push(group);
            }
            group.contacts.push(contact);
        }
        return groups;
    });



    /**
     * Loads all contacts from the database and updates the contacts signal.
     * @returns void
     */
    async getContacts(): Promise<void> {
        const { data, error } = await this.supabaseService.supabase
            .from('contacts')
            .select('id, name, initials, email, phone, color, auth_user_id');
        if (error) {
            console.error('Fehler beim Laden', error);
            return;
        }
        this.contacts.set(data ?? []);
    }



    /**
     * Updates a contact's name, email, and phone in the database and refreshes the contacts list.
     * @param id - The ID of the contact to update.
     * @param values - The updated contact values (name, email, phone).
     * @returns void
     */
    async updateContact(
        id: string,
        values: Pick<Contact, 'name' | 'email' | 'phone'>
    ): Promise<void> {
        const initials = this.createInitials(values.name);
        const { error } = await this.supabaseService.supabase
            .from('contacts')
            .update({
                name: values.name,
                email: values.email,
                phone: values.phone,
                initials
            })
            .eq('id', id);

        if (error) {
            return;
        }

        const currentContact = this.selectedContact();

        if (currentContact?.id === id) {
            this.selectedContact.set({
                ...currentContact,
                ...values,
                initials
            });
        }
        await this.getContacts();
    }



    /**
     * Deletes a contact from the database and refreshes the contacts list.
     * @param id - The ID of the contact to delete.
     * @returns void
     */
    async deleteContact(id: string): Promise<void> {
        const { error } = await this.supabaseService.supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) {
            return;
        }
        this.selectedContact.set(null);
        await this.getContacts();
    }



    /**
     * Adds a new contact to the database with formatted name, initials, and a random color.
     * @param contact - The new contact data (name, email, phone).
     * @returns An error message string if the contact could not be added, or null on success.
     */
    async addContact(contact: NewContact): Promise<string | null> {
        const contactWithInitials: ContactInsert = {
            name: this.formatName(contact.name),
            email: contact.email,
            phone: contact.phone,
            initials: this.createInitials(contact.name),
            color: this.getRandomColor()
        };

        const { data, error } = await this.supabaseService.supabase
            .from('contacts')
            .insert(contactWithInitials)
            .select('id, name, initials, email, phone, color')
            .single();

        if (error) {
            console.error('Fehler beim Hinzufügen', error);
            return 'The contact could not be added. It may already exist or contain invalid characters';
        }

        await this.getContacts();

        if (data) {
            this.selectContact(data);
        }
        return null;
    }



    /**
     * Formats a name string by capitalizing the first letter of each word and lowercasing the rest.
     * @param name - The raw name string to format.
     * @returns The formatted name string.
     */
    private formatName(name: string): string {
        return name
            .trim()
            .split(/\s+/)
            .map(part =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join(' ');
    }



    /**
     * Creates initials from a name by taking the first letter of up to two words.
     * @param name - The name string to extract initials from.
     * @returns A string containing up to two uppercase initials.
     */
    private createInitials(name: string): string {
        return name
            .trim()
            .split(/\s+/)
            .filter(part => part.length > 0)
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }



    /**
     * Returns a random color from the predefined contact colors array.
     * @returns A hex color string.
     */
    private getRandomColor(): string {
        const randomIndex = Math.floor(
            Math.random() * this.contactColors.length
        );
        return this.contactColors[randomIndex];
    }

    toastMessage = signal('');



    /**
     * Displays a toast message for 3 seconds and then clears it.
     * @param message - The message to display in the toast.
     * @returns void
     */
    triggerToast(message: string): void {
        this.toastMessage.set(message);
        setTimeout(() => {
            this.toastMessage.set('');
        }, 3000);
    }



    /**
     * Checks whether a contact is the currently logged-in user.
     * @param contact - The contact to check.
     * @returns True if the contact matches the current user, false otherwise.
     */
    isCurrentUser(contact: Contact): boolean {
        const user = this.authService.currentUser();
        return !!user && !user.is_anonymous && contact.auth_user_id === user.id;
    }



    /**
     * Sorts contacts to place the current user's contact first in the list.
     * @param contact - The array of contacts to sort.
     * @returns A new array with the current user's contact first, if applicable.
     */
    currentUserFirst(contact: Contact[]): Contact[] {
        const user = this.authService.currentUser();


        if (!user || user.is_anonymous) {
            return contact;
        }
        return [...contact].sort((a, b) => Number(this.isCurrentUser(b)) - Number(this.isCurrentUser(a))
        );
    }
}