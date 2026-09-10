import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthForm } from './auth-form';

describe('AuthForm', () => {
    let component: AuthForm;
    let fixture: ComponentFixture<AuthForm>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AuthForm],
        }).compileComponents();

        fixture = TestBed.createComponent(AuthForm);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
