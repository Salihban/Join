import { TestBed } from '@angular/core/testing';

import { Contact, ContactService } from './contact';

describe('Contact', () => {
    let service: ContactService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ContactService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
