import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../supabase';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})

export class ContactDialog {
  private fb = inject(FormBuilder);
  private dbService = inject(Supabase);

  closing = false;
  dialogOpen = signal(false);
  submitted = false;
  databaseError = signal("");

  contactForm = this.fb.group({
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
      Validators.maxLength(20),
      Validators.pattern(/^\+?\d+$/)]]
  });



  async saveContact(): Promise<void> {
    this.submitted = true;
    this.databaseError.set('');

    if (this.contactForm.invalid) {
      return;
    }

    const formValue = this.contactForm.value;
    const errorMessage = await this.dbService.addContact({
      name: formValue.name ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? ''
    });

    if (errorMessage) {
      this.databaseError.set(errorMessage);
      return;
    }
    this.closeDialog();
  }



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



  animationEnd() {
    if (this.closing) {
      this.dialogOpen.set(false);
      this.closing = false;
    }
  }

  open(){
    this.dialogOpen.set(true);
  }
}
