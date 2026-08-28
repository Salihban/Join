import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';

type Priority = 'urgent' | 'medium' | 'low';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm {
    private formBuilder = inject(FormBuilder);

    taskForm = this.formBuilder.nonNullable.group({
        title: ['', Validators.required],
        description: [''],
        dueData: ['', Validators.required],
        priority: ['medium' as Priority],
        assignedContactIds: this.formBuilder.nonNullable.control<string[]>([]),
        category: ['', Validators.required],
        subtasks: this.formBuilder.array<FormControl<string>>([])
    });

    submitForm(): void {
        if (this.taskForm.invalid) {
            this.taskForm.markAllAsTouched();
            return;
        }
    }

    clearForm(): void {
        this.taskForm.reset({
            title: '',
            description: '',
            dueData: '',
            priority: 'medium',
            assignedContactIds: [],
            category: ''
        });
    this.taskForm.controls.subtasks.clear();
    }
}
