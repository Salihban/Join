import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { Task, TaskService } from '../../services/task';
import { TaskForm } from '../task-form/task-form';

@Component({
    selector: 'app-task-details',
    imports: [TaskForm],
    templateUrl: './task-details.html',
    styleUrl: './task-details.scss',
})
export class TaskDetails {
    isEditing = false;
    private taskService = inject(TaskService);
    @Input({ required: true }) task!: Task;
    @Output() closeDetails = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<Task>();
    @Output() deleteTask = new EventEmitter<number>();

    async requestDelete(): Promise<void> {
    const confirmed = confirm(`Möchtest du den Task "${this.task.title}" wirklich löschen?`);
    if (!confirmed) return;

    const success = await this.taskService.deleteTask(this.task.id);
    if (success) {
        this.deleteTask.emit(this.task.id);
        this.closeDetails.emit();
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

    async toggleSubtask(subtask: any, event: Event): Promise<void> {
    const completed = (event.target as HTMLInputElement).checked;
    const success = await this.taskService.updateSubtaskCompleted(subtask.id,completed);
    if (success) {
    subtask.completed = completed;
    this.taskUpdated.emit(this.task);
    }
}
}