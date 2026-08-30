import { computed, Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

export interface Contact {
    id: string;
    name: string;
    initials: string;
    email: string;
    phone: string;
    color: string;
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

export interface NewTask {
    title: string;
    description: string;
    dueDate: string;
    priority: 'urgent' | 'medium' | 'low';
    category: string;
    assignedContactIds: Array<string | number>;
    subtasks: string[];
}

interface ContactInsert extends NewContact {
    initials: string;
    color: string;
}

@Injectable({
    providedIn: 'root'
})

export class Supabase {
    readonly supabaseUrl: string = 'https://mbifznamhyihpgduvqru.supabase.co';
    readonly supabaseKey: string = 'sb_publishable_JUaeWi8_jhlIrDYKFIr-HQ_ZPNiPis2';
    readonly supabase = createClient(this.supabaseUrl, this.supabaseKey);
    readonly contacts = signal<Contact[]>([]);
    readonly selectedContact = signal<Contact | null>(null);

    readonly contactColors = [
        '#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF',
        '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E',
        '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B',
        '#FFE62B', '#FF4646'
    ];
    selectContact(contact: Contact): void {
        this.selectedContact.set(null);

        setTimeout(() => {
            this.selectedContact.set(contact);
        })
    }
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
            .select('id, name, initials, email, phone,color');

        if (error) {
            console.error('Fehler beim Laden', error);
            return;
        }

        if (!contacts) return;
        this.contacts.set(contacts);
    }

    async updateContact(
        id: string,
        values: Pick<Contact, 'name' | 'email' | 'phone'>
    ): Promise<void> {
        const newInitials = this.createInitials(values.name);
        await this.supabase
            .from('contacts')
            .update({
                name: values.name,
                email: values.email,
                phone: values.phone,
                initials: newInitials,
            })
            .eq('id', id);

        const current = this.selectedContact();
        if (current && current.id === id) {
            this.selectedContact.set({
                id: current.id,
                name: values.name,
                email: values.email,
                phone: values.phone,
                initials: newInitials,
                color: current.color
            });
        }
        await this.getContacts();
    }

    async deleteContact(id: string): Promise<void> {
        await this.supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        this.selectedContact.set(null);
        await this.getContacts();
    }

    async addContact(contact: NewContact): Promise<string | null> {
        const contactWithInitials: ContactInsert = {
            name: this.formatName(contact.name),
            email: contact.email,
            phone: contact.phone,
            initials: this.createInitials(contact.name),
            color: this.getRandomColor()
        };
        const { data, error } = await this.supabase
            .from('contacts')
            .insert(contactWithInitials)
            .select('id, name, initials, email, phone,color')
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

    private formatName(name: string): string {
        const nameFormated = name.trim()
            .split(/\s+/)
            .map(part =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            )
            .join(' ');

        return nameFormated;
    }

    private createInitials(name: string): string {
        const initials = name.trim()
            .split(/\s+/)
            .filter(part => part.length > 0)
            .map(part => part.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');

        return initials;
    }

    private getRandomColor(): string {
        const randomIndex = Math.floor(
            Math.random() * this.contactColors.length
        );

        return this.contactColors[randomIndex];
    }
    toastMessage = signal('');

    triggerToast(message: string) {
        this.toastMessage.set(message);
        setTimeout(() => {
            this.toastMessage.set('');
        }, 3000);
    }

    async addTask(task: NewTask): Promise<boolean> {
        const { data, error } = await this.supabase.from('task').insert({
            title: task.title.trim(),
            description: task.description.trim(),
            due_date: task.dueDate,
            priority: task.priority,
            category: task.category,
            status: 'todo'
        }).select('id').single();

    if (error || !data) {
    console.error('Task konnte nicht gespeichert werden:', error);
    return false;
    }

    const assigneesSaved = await this.addTaskAssignees(data.id, task.assignedContactIds);
    const subtasksSaved = await this.addSubtasks(data.id, task.subtasks);

    if (!assigneesSaved || !subtasksSaved) {
    await this.supabase.from('task').delete().eq('id', data.id);
    return false;
    }
    return true;
}

    private async addTaskAssignees(
        taskId: number,
        contactIds: Array<string | number>
    ): Promise<boolean> {
    if (!contactIds.length) return true;

    const rows = contactIds.map(contactId => ({
        task_id: taskId,
        contact_id: contactId
    }));
    const { error } = await this.supabase.from('task_assignees').insert(rows);

    if (error) console.error('Assignees-Fehler:', error);
    return !error;
    }

    private async addSubtasks(
        taskId: number,
        subtasks: string[]
    ): Promise<boolean> {
    if (!subtasks.length) return true;

    const rows = subtasks.map(title => ({
        task_id: taskId,
        title,
        completed: false
    }));
    const { error } = await this.supabase.from('subtask').insert(rows);

    if (error) console.error('Subtask-Fehler:', error);
    return !error;
    }
}