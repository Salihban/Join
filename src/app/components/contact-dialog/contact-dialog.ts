import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../services/contact';


@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})


export class ContactDialog {
  private fb = inject(FormBuilder);
  public contactService = inject(ContactService);


  contactSaved = output<void>();
  closing = false;
  dialogOpen = signal(false);
  submitted = false;
  databaseError = signal("");


  contactForm = this.fb.group({
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
   * Saves the contact by submitting the form data to the contact service.
   * Displays validation errors or database errors if the save fails.
   */
  async saveContact(): Promise<void> {
    this.submitted = true;
    this.databaseError.set('');


    if (this.contactForm.invalid) {
      return;
    }


    const formValue = this.contactForm.value;
    const errorMessage = await this.contactService.addContact({
      name: formValue.name ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? ''
    });


    if (errorMessage) {
      this.databaseError.set(errorMessage);
      return;
    }


    this.contactService.triggerToast('Contact succesfully created');
    this.closeDialog();
    this.contactSaved.emit();
  }


  /**
   * Closes the dialog and resets the form to its initial state.
   * Sets the closing flag to trigger the close animation.
   */
  closeDialog() {
    this.contactForm.reset({
      name: '',
      email: '',
      phone: ''
    });
    this.submitted = false;
    this.databaseError.set('');
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
   * Handles the end of the dialog's open/close animation.
   * Resets animation state after the dialog is fully closed.
   */
  animationEnd() {
    if (this.closing) {
      this.dialogOpen.set(false);
      this.closing = false;
    }
  }


  /**
   * Opens the dialog by setting the dialogOpen signal to true.
   */
  open() {
    this.dialogOpen.set(true);
  }
}