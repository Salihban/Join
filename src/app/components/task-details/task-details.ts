import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from '../../services/task';
import { TaskForm } from '../task-form/task-form';

@Component({
    selector: 'app-task-details',
    imports: [TaskForm],
    templateUrl: './task-details.html',
    styleUrl: './task-details.scss',
})
export class TaskDetails {
    isEditing = false;

    @Input({ required: true }) task!: Task;
    @Output() closeDetails = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<Task>();
    @Output() deleteTask = new EventEmitter<number>();

    requestDelete(): void {
    const confirmed = confirm(`Möchtest du den Task "${this.task.title}" wirklich löschen?`);

    if (confirmed) {
        this.deleteTask.emit(this.task.id);
    }
}

    startEditing(): void {
    this.isEditing = true;
    }

    cancelEditing(): void {
    this.isEditing = false;
    }

    onTaskUpdate(updatedTask: Task): void {
    this.task = updatedTask;
    this.isEditing = false;
    this.taskUpdated.emit(updatedTask);
    }
}