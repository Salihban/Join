import { Component, inject, effect, signal, OnInit } from '@angular/core';
import { Supabase } from '../../supabase';
import { ContactDialog } from '../contact-dialog/contact-dialog';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [ContactDialog],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss'
})
export class ContactList implements OnInit{
  dbService = inject(Supabase);
  toastMessage = signal('');

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

  onContactSaved() {
        this.dbService.triggerToast('Contact succesfully created');
    }

    onContactDeleted() {
        this.triggerToast('Contact Delete succsessfull');
    }

    private triggerToast(message: string) {
        this.toastMessage.set(message);
        setTimeout(() => this.toastMessage.set(''), 3000);
    }
}