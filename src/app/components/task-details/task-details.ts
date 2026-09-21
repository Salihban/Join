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


    
    /**
     * Requests deletion of the current task after user confirmation.
     * Emits delete and close events if the deletion is successful.
     */
    async requestDelete(): Promise<void> {
        const confirmed = confirm(`Möchtest du den Task "${this.task.title}" wirklich löschen?`);
        if (!confirmed) return;


        const success = await this.taskService.deleteTask(this.task.id);
        if (success) {
            this.deleteTask.emit(this.task.id);
            this.closeDetails.emit();
        }
    }



    /**
     * Enables edit mode for the current task.
     */
    startEditing(): void {
        this.isEditing = true;
    }



    /**
     * Cancels edit mode and returns to view mode.
     */
    cancelEditing(): void {
        this.isEditing = false;
    }



    /**
     * Handles the task update event from the task form.
     * Updates the local task reference, disables edit mode, and emits the update event.
     * @param updatedTask - The updated task data received from the form.
     */
    onTaskUpdate(updatedTask: Task): void {
        this.task = updatedTask;
        this.isEditing = false;
        this.taskUpdated.emit(updatedTask);
    }



    /**
     * Toggles the completion state of a subtask and persists the change.
     * Emits a task update event if the operation succeeds.
     * @param subtask - The subtask object to update.
     * @param event - The checkbox change event containing the new completion state.
     */
    async toggleSubtask(subtask: any, event: Event): Promise<void> {
        const completed = (event.target as HTMLInputElement).checked;
        const success = await this.taskService.updateSubtaskCompleted(subtask.id, completed);
        if (success) {
            subtask.completed = completed;
            this.taskUpdated.emit(this.task);
        }
    }



    /**
     * Returns the display name for the task's category.
     * @returns 'User Story' for user_story category, 'Technical Task' otherwise.
     */
    get categoryName(): string {
        return this.task.category === 'user_story' ? 'User Story' : 'Technical Task';
    }
}