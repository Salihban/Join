import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../supabase';

@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {
  private fb = inject(FormBuilder);
  dbService = inject(Supabase);

  contactDeleted = output<void>();

  closing = false;
  dialogOpen = false;
  menuOpen = false;

  goBack(): void {
    this.dbService.selectedContact.set(null);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  openEditDialog(): void {
    const contact = this.dbService.selectedContact();
    if (!contact) return;

    this.contactForm.patchValue(contact);
    this.menuOpen = false;
    this.closing = false;
    this.dialogOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDialog(): void {
    this.dialogOpen = false;
    this.closing = false;
    document.body.style.overflow = '';
  }

  contactForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s-]+$/),
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.pattern(
          /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)?@[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){1,2}$/
        ),
      ],
    ],
    phone: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^\+?[\d\s-]+$/),
      ],
    ],
  });

  async saveContact(): Promise<void> {
    const contact = this.dbService.selectedContact();

    if (!contact || this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.dialogOpen = false;
    this.closing = false;
    document.body.style.overflow = '';

    this.dbService.triggerToast('Contact successfully saved');

  
    await this.dbService.updateContact(contact.id, this.contactForm.getRawValue());
  }

  async deleteContact(): Promise<void> {
    const contact = this.dbService.selectedContact();
    if (!contact) return;

    this.menuOpen = false;
    this.dialogOpen = false;
    this.closing = false;
    document.body.style.overflow = '';

    this.dbService.triggerToast('Contact successfully deleted');

    await this.dbService.deleteContact(contact.id);
  }
}