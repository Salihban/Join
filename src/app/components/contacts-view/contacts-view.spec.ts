import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsView } from './contacts-view';

describe('ContactsView', () => {
    let component: ContactsView;
    let fixture: ComponentFixture<ContactsView>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContactsView],
        }).compileComponents();

        fixture = TestBed.createComponent(ContactsView);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
