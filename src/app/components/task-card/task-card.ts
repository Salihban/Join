import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { Task } from '../../services/task';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
    selector: 'app-task-card',
    imports: [MatProgressBarModule],
    templateUrl: './task-card.html',
    styleUrl: './task-card.scss',
})
export class TaskCard {
    @Input({ required: true }) task!: Task;
    @Input() isMenuOpen = false;
    @Output() menuToggled = new EventEmitter<Event>();
    @Output() statusChanged = new EventEmitter<{
        taskId: number;
        status: Task['status'];
    }>();



    /**
     * Toggles the task card's context menu and emits the toggle event.
     * Prevents event propagation to avoid triggering parent click handlers.
     * @param event - The click event that triggered the menu toggle.
     */
    toggleMenu(event: Event): void {
        event.stopPropagation();
        this.menuToggled.emit(event);
    }



    /**
     * Emits a status change event for the current task.
     * Prevents event propagation to avoid triggering parent click handlers.
     * @param status - The new status to assign to the task.
     * @param event - The click event that triggered the status change.
     */
    currentStatus(status: Task['status'], event: Event): void {
        event.stopPropagation();
        this.statusChanged.emit({
            taskId: this.task.id,
            status: status
        });
    }



    /**
     * Returns the display name for the task's category.
     * @returns 'User Story' for user_story category, 'Technical Task' otherwise.
     */
    get categoryName(): string {
        return this.task.category === 'user_story'
            ? 'User Story'
            : 'Technical Task';
    }



    /**
     * Returns the total number of subtasks for this task.
     * @returns The count of subtasks, or 0 if no subtasks exist.
     */
    get totalSubtasks(): number {
        return this.task.subtasks?.length ?? 0;
    }



    /**
     * Returns the number of completed subtasks for this task.
     * @returns The count of completed subtasks, or 0 if no subtasks exist.
     */
    get completedSubtasks(): number {
        return this.task.subtasks?.filter(
            subtask => subtask.completed
        ).length ?? 0;
    }



    /**
     * Calculates the completion progress of the task as a percentage.
     * @returns A value between 0 and 100 representing the subtask completion rate.
     */
    get progressValue(): number {
        if (this.totalSubtasks === 0) {
            return 0;
        }
        
        return (this.completedSubtasks / this.totalSubtasks) * 100;
    }
}