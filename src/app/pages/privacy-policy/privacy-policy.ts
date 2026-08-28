import { Component } from '@angular/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-privacy-policy',
  imports: [],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss',
})
export class PrivacyPolicy {
  constructor(private location: Location){}

  goBack(): void {
    this.location.back();
  }
}
