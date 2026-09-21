import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact';


@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {



  /**
   * Closes the contact info view by resetting the selected contact and menu state.
   */
  goBack(): void {
    this.menuOpen = false;
    this.contactService.selectedContact.set(null);
  }

  private fb = inject(FormBuilder);
  contactService = inject(ContactService);


  contactDeleted = output<void>();


  closing = false;
  dialogOpen = false;
  menuOpen = false;



  /**
   * Toggles the visibility of the contact options menu.
   */
  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }



  /**
   * Opens the edit dialog and populates the form with the selected contact's data.
   * Prevents body scrolling while the dialog is open.
   */
  openEditDialog(): void {
    const contact = this.contactService.selectedContact();
    if (!contact) return;


    this.contactForm.patchValue(contact);
    this.menuOpen = false;
    this.closing = false;
    this.dialogOpen = true;
    document.body.style.overflow = 'hidden';
  }



  /**
   * Initiates the dialog close animation.
   */
  closeDialog() {
    this.closing = true;
  }



  /**
   * Marks a form control as dirty when the user starts typing.
   * @param controlName - The name of the form control being edited.
   */
  onInput(controlName: 'name' | 'email' | 'phone'): void {
    this.contactForm.get(controlName)?.markAsDirty();
  }



  /**
   * Handles the end of the dialog's close animation.
   * Resets dialog state and restores body scrolling.
   */
  animationEnd() {
    if (this.closing) {
      this.dialogOpen = false;
      this.closing = false;
      document.body.style.overflow = '';
    }
  }



  contactForm = this.fb.nonNullable.group({
    name: ['',
      [Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s-]+$/)
      ]],


    email: ['',
      [Validators.required,
      Validators.pattern(/^(?!.*[._-]{2})([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9._-]*[a-zA-Z0-9])@[a-zA-Z-]+(?:\.[a-zA-Z-]+)+$/)
      ]],


    phone: ['',
      [Validators.required,
      Validators.minLength(7),
      Validators.maxLength(20),
      Validators.pattern(/^\+?[\d\s]+$/)
      ]]
  });



  /**
   * Saves the edited contact by sending the updated form values to the contact service.
   * Validates the form and displays a success toast upon completion.
   */
  async saveContact(): Promise<void> {
    const contact = this.contactService.selectedContact();


    if (!contact || this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }


    this.dialogOpen = false;
    this.closing = false;
    document.body.style.overflow = '';

    this.contactService.triggerToast('Contact successfully saved');

    await this.contactService.updateContact(contact.id, this.contactForm.getRawValue());
  }



  /**
   * Deletes the currently selected contact and emits a deletion event.
   * Displays a success toast upon completion.
   */
  async deleteContact(): Promise<void> {
    const contact = this.contactService.selectedContact();
    if (!contact) return;


    this.menuOpen = false;
    this.dialogOpen = false;
    this.closing = false;
    document.body.style.overflow = '';

    this.contactService.triggerToast('Contact successfully deleted');

    await this.contactService.deleteContact(contact.id);
  }
}