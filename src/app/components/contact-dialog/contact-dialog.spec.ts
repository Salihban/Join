import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDialog } from './contact-dialog';

describe('ContactDialog', () => {
  let component: ContactDialog;
  let fixture: ComponentFixture<ContactDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
