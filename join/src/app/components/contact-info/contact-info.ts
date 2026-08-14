import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact-info',
  imports: [ReactiveFormsModule],
  templateUrl: './contact-info.html',
  styleUrl: './contact-info.scss',
})
export class ContactInfo {
  private fb = inject(FormBuilder);

  closing = false;
  dialogOpen = false;
  menuOpen = false;

  toggleMenu(): void{
    this.menuOpen = !this.menuOpen;
  }

  openEditDialog(): void{
    this.menuOpen = false;
    this.dialogOpen = true;
  }

  deleteContact(): void{
    this.menuOpen = false;
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
  

  contactForm = this.fb.group({
    name:'',
    email:'',
    phone:''
  });
}