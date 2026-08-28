import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskOverlay } from './task-overlay';

describe('TaskOverlay', () => {
    let component: TaskOverlay;
    let fixture: ComponentFixture<TaskOverlay>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TaskOverlay],
        }).compileComponents();

        fixture = TestBed.createComponent(TaskOverlay);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
