import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { Contact, ContactService } from '../../services/contact';
import { TaskService } from '../../services/task';
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
    readonly contactService = inject(ContactService);
    readonly taskService = inject(TaskService);
    readonly contacts = this.contactService.contacts;
    subtaskInput = this.formBuilder.nonNullable.control('');
    dropdownOpen = false;

    ngOnInit(): void {
        this.contactService.getContacts();
    }

    @Output() taskCreated = new EventEmitter<void>();
    isSaving = false;

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

    addSubtask(event?: Event): void {
        event?.preventDefault();
        const title = this.subtaskInput.value.trim();
        const subtasks = this.taskForm.controls.subtasks;

        if (title || subtasks.value.includes(title)) return;
        subtasks.push(this.formBuilder.nonNullable.control(title));
        this.subtaskInput.reset();
    }

    removeSubtask(index: number): void {
        this.taskForm.controls.subtasks.removeAt(index);
    }

    async submitForm(): Promise<void> {
        const title = this.taskForm.controls.title;

        if (!title.value.trim()) {
            title.setErrors({required: true});
        }

        if (this.taskForm.invalid) {
            this.taskForm.markAllAsTouched();
            return;
        }
        this.isSaving = true;

        const success = await this.taskService.addTask(this.taskForm.getRawValue());
        this.isSaving = false;

        if (!success) {
            this.contactService.triggerToast('Task could not be created');
            return;
        }
        this.contactService.triggerToast('Task successfully created');
        this.taskCreated.emit();
        this.clearForm();
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
    this.subtaskInput.reset();
    }
}