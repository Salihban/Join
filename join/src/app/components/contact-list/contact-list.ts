import { Component, inject, effect } from '@angular/core';
import { Supabase } from '../../supabase';
import { ContactDialog } from '../contact-dialog/contact-dialog';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [ContactDialog],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss'
})
export class ContactList {
  dbService = inject(Supabase);

constructor() {
  effect(() => {
    const selectedContact = this.dbService.selectedContact();
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
    this.dbService.getContacts();
  }
}