import { TestBed } from '@angular/core/testing';

import { Task, TaskService } from './task';

describe('Task', () => {
    let service: TaskService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TaskService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
