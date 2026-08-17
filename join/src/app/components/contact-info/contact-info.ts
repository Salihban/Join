import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../supabase';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {
  private fb = inject(FormBuilder);
  dbService = inject(Supabase);

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
  }

  closeDialog(){
    this.closing = true;
  }
    animationEnd(){
      if (this.closing){
        this.dialogOpen = false;
        this.closing = false;
      }
    }
  

  contactForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]]
  });

  async saveContact(): Promise<void> {
    const contact = this.dbService.selectedContact();

    if (!contact || this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    await this.dbService.updateContact(contact.id, this.contactForm.getRawValue());
    this.dialogOpen = false;
  }

  async deleteContact(): Promise<void> {
    const contact = this.dbService.selectedContact();
    if (!contact) return;

    await this.dbService.deleteContact(contact.id);
    this.menuOpen = false;
    this.dialogOpen = false;
  }
}