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
export class ContactList implements OnInit {
  contactService = inject(ContactService);
  toastMessage = signal('');



  /**
 * Sets up a reactive effect to scroll the selected contact into view when it changes.
 * Uses requestAnimationFrame to ensure the DOM is updated before scrolling.
 */
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



  /**
     * Initializes the component by loading all contacts from the service.
     */
  ngOnInit(): void {
    this.contactService.getContacts();
  }



  /**
 * Handles the contact deletion event and displays a success toast message.
 */
  onContactDeleted() {
    this.contactService.triggerToast('Contact delete successful');
  }
}