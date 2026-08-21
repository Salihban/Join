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

  goBack(): void {
    this.menuOpen = false;
    this.dbService.selectedContact.set(null);
  }
  
  private fb = inject(FormBuilder);
  dbService = inject(Supabase);

  contactDeleted = output<void>();
  closing = false;
  dialogOpen = false;
  menuOpen = false;

  toggleMenu(): void{
    this.menuOpen = !this.menuOpen;
  }

  openEditDialog(): void{
    const contact = this.dbService.selectedContact();
    if (!contact) return;

    this.contactForm.patchValue(contact);
    this.menuOpen = false;
    this.dialogOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeDialog(){
    this.closing = true;
  }
    animationEnd(){
      if (this.closing){
        this.dialogOpen = false;
        this.closing = false;
        document.body.style.overflow = '';
      }
    }
  

  contactForm = this.fb.nonNullable.group({
    name: ['',
      [Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
      Validators.pattern(/^[a-zA-ZäöüÄÖÜß\s-]+$/)
      ]],

    email: ['',
      [Validators.required,
      Validators.email,
      Validators.pattern(
        /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)?@[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*){1,2}$/)
      ]],

    phone: ['',
      [Validators.required,
        Validators.minLength(7),
      Validators.maxLength(20),
      Validators.pattern(/^\+?\d+$/)]]
  });

  async saveContact(): Promise<void> {
    const contact = this.dbService.selectedContact();

    if (!contact || this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    await this.dbService.updateContact(contact.id, this.contactForm.getRawValue());
    this.dialogOpen = false;

    this.dbService.triggerToast('Contact succesfully saved');
  }

  async deleteContact(): Promise<void> {
    const contact = this.dbService.selectedContact();
    if (!contact) return;

    await this.dbService.deleteContact(contact.id);
    this.menuOpen = false;
    this.dialogOpen = false;

    this.dbService.selectedContact.set(null);
    this.dbService.triggerToast('Contact succesfully deleted');
  }
}