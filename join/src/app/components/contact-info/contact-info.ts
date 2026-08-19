import { Component, inject, output } from '@angular/core'; // 1. output HIER IMPORTIEREN
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

  // 2. DAS EVENT FÜR DIE CONTACT-LIST DEFINIEREN
  contactDeleted = output<void>();

  closing = false;
  dialogOpen = false;
  menuOpen = false;

  goBack(): void {
    console.log('zurück wurde geklickt');
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
    this.dialogOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDialog() {
    this.closing = true;
  }

  animationEnd() {
    if (this.closing) {
      this.dialogOpen = false;
      this.closing = false;
      document.body.style.overflow = '';
    }
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
          /^[a-zA-Z0-9]+(?:.[a-zA-Z0-9]+)?@[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)(?:.[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)){1,2}$/
        ),
      ],
    ],
    phone: [
      '',
      [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^\+?\d+$/),
      ],
    ],
  });

  async saveContact(): Promise<void> {
  const contact = this.dbService.selectedContact();

  if (!contact || this.contactForm.invalid) {
    this.contactForm.markAllAsTouched();
    return;
  }

  await this.dbService.updateContact(contact.id, this.contactForm.getRawValue());
  this.dialogOpen = false;

  // NEU: Rufe hier ebenfalls den Service-Toast auf!
  this.dbService.triggerToast('Kontakt erfolgreich gespeichert!');
}

  async deleteContact(): Promise<void> {
  const contact = this.dbService.selectedContact();
  if (!contact) return;

  await this.dbService.deleteContact(contact.id);
  this.menuOpen = false;
  this.dialogOpen = false;
  this.dbService.selectedContact.set(null);

  // Triggert den Toast global:
  this.dbService.triggerToast('Kontakt erfolgreich gelöscht!');
}
}