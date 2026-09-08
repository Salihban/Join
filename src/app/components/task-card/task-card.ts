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

    @Input({ required: true }) task!: Task;

    @Output() statusChanged = new EventEmitter<{
        taskId: number;
        status: Task['status'];
    }>();

    menuOpen = false;

    toggleMenu(event: Event): void {
        event.stopPropagation();
        this.menuOpen = !this.menuOpen;
    }

    currentStatus(status: Task['status'], event: Event): void {
        event.stopPropagation();
        this.statusChanged.emit({
            taskId: this.task.id,
            status: status
        });
        this.menuOpen = false;
    }

    get categoryName(): string {
        return this.task.category === 'user_story'
            ? 'User Story'
            : 'Technical Task';
    }

    get totalSubtasks(): number {
        return this.task.subtasks?.length ?? 0;
    }

    get completedSubtasks(): number {
        return this.task.subtasks?.filter(
            subtask => subtask.completed
        ).length ?? 0;
    }

    get progressValue(): number {
        if (this.totalSubtasks === 0) {
            return 0;
        }

        return (this.completedSubtasks / this.totalSubtasks) * 100;
    }
}