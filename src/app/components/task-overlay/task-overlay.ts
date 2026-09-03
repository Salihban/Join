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

    onTaskCreated():void {
        this.dialogRef.close(true);
    }

    onClose(): void {
        this.dialogRef.close(false);
    }
}
