import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-dialog',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './contact-dialog.html',
  styleUrl: './contact-dialog.scss',
})
export class ContactDialog {
  private fb = inject(FormBuilder);

  dialogOpen = false;

  contactForm = this.fb.group({
    name:'',
    email:'',
    phone:''
  });
}
