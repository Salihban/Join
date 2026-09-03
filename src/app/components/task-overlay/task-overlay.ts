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
        console.log('[TaskFormDialog] Task created,closing dialog');
        this.dialogRef.close(true);
    }

    onClose(): void {
        console.log('[TaskFormDialog] Close button clicked');
        this.dialogRef.close(false);
    }
}
