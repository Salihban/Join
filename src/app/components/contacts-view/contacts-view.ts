import { Component, inject } from '@angular/core';
import { ContactService } from '../../services/contact';
import { ContactList } from '../contact-list/contact-list';
import { ContactInfo } from '../contact-info/contact-info';




@Component({
    selector: 'app-contacts-view',
    imports: [ContactList, ContactInfo],
    templateUrl: './contacts-view.html',
    styleUrl: './contacts-view.scss',
})
export class ContactsView {
    contactService = inject(ContactService);
}
