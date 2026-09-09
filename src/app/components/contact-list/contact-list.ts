import { Component, inject, effect, signal, OnInit } from '@angular/core';
import { ContactDialog } from '../contact-dialog/contact-dialog';
import { ContactService } from '../../services/contact';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [ContactDialog],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss'
})
export class ContactList implements OnInit{
  contactService = inject(ContactService);
  toastMessage = signal('');

constructor() {
  effect(() => {
    const selectedContact = this.contactService.selectedContact();
    if (!selectedContact) {
      return;
    }

    requestAnimationFrame(() => {
    const contactElement = document.getElementById(selectedContact.id);

      if (contactElement) {
        contactElement.scrollIntoView({
          block: 'nearest',
        });
      }
    });
  });
}

  ngOnInit(): void {
    this.contactService.getContacts();
  }

    onContactDeleted() {
        this.contactService.triggerToast('Contact Delete successful');
    }
}