import { Component, EventEmitter, input, Input, Output } from '@angular/core';
import { Task } from '../../services/task';

@Component({
    selector: 'app-task-details',
    imports: [],
    templateUrl: './task-details.html',
    styleUrl: './task-details.scss',
})
export class TaskDetails {
    @Input({ required: true }) task!: Task;

    @Output() closeDetails = new EventEmitter<void>();
    @Output() editTask = new EventEmitter<Task>();
    @Output() deleteTask = new EventEmitter<number>();

    requestDelete(): void {
        const confirmed = confirm(`Möchtest du den Task "${this.task.title}" wirklich löschen?`);
        if (confirmed) {
            this.deleteTask.emit(this.task.id);
        }
    }
}
