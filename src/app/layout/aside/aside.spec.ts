import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Aside } from './aside';

describe('Footer', () => {
  let component: Aside;
  let fixture: ComponentFixture<Aside>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aside],
    }).compileComponents();

    fixture = TestBed.createComponent(Aside);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
