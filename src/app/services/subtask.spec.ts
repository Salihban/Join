import { TestBed } from '@angular/core/testing';

import { Subtask } from '../services/subtask';

describe('Subtask', () => {
    let service: Subtask;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Subtask);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
