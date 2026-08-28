import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardColumn } from './board-column';

describe('BoardColumn', () => {
    let component: BoardColumn;
    let fixture: ComponentFixture<BoardColumn>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BoardColumn],
        }).compileComponents();

        fixture = TestBed.createComponent(BoardColumn);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
