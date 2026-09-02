import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task } from '../../services/task';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
    selector: 'app-task-card',
    imports: [MatProgressBarModule],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    @Input({required: true}) task!: Task;
    @Output() taskSelected = new EventEmitter<Task>();

    openTask(): void {
        this.taskSelected.emit(this.task);
    }
    get categoryName(): string {
        return this.task.category === 'user_story'
                ? 'User Story'
                : 'Technical Task';
    }
}
