import { Component, inject, OnInit } from '@angular/core';
import { Contact, Supabase } from '../../supabase';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

type Priority = 'urgent' | 'medium' | 'low';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit{
    private formBuilder = inject(FormBuilder);
    readonly dbService = inject(Supabase);
    readonly contacts = this.dbService.contacts;

    ngOnInit(): void {
        this.dbService.getContacts();
    }

    toggleDropDown(): void {
        this.dropdownOpen = !this.dropdownOpen;
    }

    toggleContact(contactId: string): void {
        const control = this.taskForm.controls.assignedContactIds;
        const ids = control.value;

        control.setValue(
            ids.includes(contactId)? ids.filter(id => id !== contactId): [...ids, contactId]
        );
    }

    isSelected(contactId: string): boolean {
        return this.taskForm.controls.assignedContactIds.value.includes(contactId);
    }

    get selectContacts(): Contact[] {
        const ids = this.taskForm.controls.assignedContactIds.value;

        return this.contacts().filter(contact => ids.includes(contact.id));
    }

    taskForm = this.formBuilder.nonNullable.group({
        title: ['', Validators.required],
        description: [''],
        dueDate: ['', Validators.required],
        priority: ['medium' as Priority],
        assignedContactIds: this.formBuilder.nonNullable.control<string[]>([]),
        category: ['', Validators.required],
        subtasks: this.formBuilder.array<FormControl<string>>([])
    });

    priorities: Priority[] = ['urgent', 'medium', 'low'];
    setPriority(priority: Priority): void {
        this.taskForm.controls.priority.setValue(priority);
    }

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
            dueDate: '',
            priority: 'medium',
            assignedContactIds: [],
            category: ''
        });
    this.taskForm.controls.subtasks.clear();
    }
}
