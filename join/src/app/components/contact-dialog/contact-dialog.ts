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

  closing = false;
  dialogOpen = false;

  closeDialog(){
    this.closing = true;
  }
    animationEnd(){
      if (this.closing){
        this.dialogOpen = false;
        this.closing = false;
      }
    }
  

  contactForm = this.fb.group({
    name:'',
    email:'',
    phone:''
  });
}
