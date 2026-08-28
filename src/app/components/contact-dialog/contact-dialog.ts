import { Component, inject, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supabase } from '../../services/supabase';

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
    this.contactSaved.emit();
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



  onInput(controlName: 'name' | 'email' | 'phone'): void {
    this.contactForm.get(controlName)?.markAsDirty();
  }

  animationEnd() {
    if (this.closing) {
      this.dialogOpen.set(false);
      this.closing = false;
    }
  }

  open() {
    this.dialogOpen.set(true);
  }
}
