import { Component, inject } from '@angular/core';
import { Supabase } from '../../supabase';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [],
  templateUrl: './contact-list.html',
  styleUrl: './contact-list.scss'
})
export class ContactList {
  dbService = inject(Supabase);

  ngOnInit(): void {
    this.dbService.getContacts();
  }
}