import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TaskForm } from '../task-form/task-form';


@Component({
    selector: 'app-task-overlay',
    imports: [TaskForm],
    templateUrl: './task-overlay.html',
    styleUrl: './task-overlay.scss',
})
export class TaskOverlay {
    private dialogRef = inject(MatDialogRef<TaskOverlay>);



    /**
     * Handles the task creation event by closing the dialog with a success result.
     * @returns void
     */
    onTaskCreated(): void {
        this.dialogRef.close(true);
    }



    /**
     * Handles the dialog close event by closing the dialog with a cancel result.
     * @returns void
     */
    onClose(): void {
        this.dialogRef.close(false);
    }
}