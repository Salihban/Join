import { Component, inject } from '@angular/core';
import { ContactList } from '../contact-list/contact-list';
import { ContactInfo } from '../contact-info/contact-info';
import { Supabase } from '../../supabase';


@Component({
    selector: 'app-contacts-view',
    imports: [ContactList, ContactInfo],
    templateUrl: './contacts-view.html',
    styleUrl: './contacts-view.scss',
})
export class ContactsView {
    dbService = inject(Supabase)
}
