import { Component } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-help',
  imports: [],
  templateUrl: './help.html',
  styleUrl: './help.scss',
})

export class Help {constructor(private location: Location){}
  // goBack(): void {
  //   this.location.back();
  // }
  // 
export class Help {
  constructor(private location: Location){}

  goBack(): void {
    this.location.back();
  }
}
