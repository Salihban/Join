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

  readonly contactColors = ['#FF7A00','#FF5EB3','#6E52FF','#9327FF','#00BEE8','#1FD7C1','#FF745E','#FFA35E','#FC71FF','#FFC701','#0038FF','#C3FF2B','#FFE62B','#FF4646'];

  ngOnInit(): void {
    this.dbService.getContacts();
  }

  getRandomColor(): string {
    const randomIndex = Math.floor(
      Math.random() * this.contactColors.length
    );

    return this.contactColors[randomIndex];
  }
}
