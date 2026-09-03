import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Contact, ContactService } from '../../services/contact';
import { TaskService, Task } from '../../services/task';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

type Priority = 'urgent' | 'medium' | 'low';

@Component({
    selector: 'app-task-form',
    imports: [ReactiveFormsModule, TitleCasePipe],
    templateUrl: './task-form.html',
    styleUrl: './task-form.scss',
})
export class TaskForm implements OnInit {
    private formBuilder = inject(FormBuilder);
    readonly contactService = inject(ContactService);
    readonly taskService = inject(TaskService);
    readonly contacts = this.contactService.contacts;
    subtaskInput = this.formBuilder.nonNullable.control('');
    dropdownOpen = false;
    categoryDropdownOpen = false;
    showAllContacts = false;
    editingIndex: number | null = null;

    @Input() task?: Task;
    @Output() taskCreated =new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<Task>();
    @Output() cancelled = new EventEmitter<void>();

    ngOnInit(): void {
        this.contactService.getContacts();

        if (this.task) {
            this.loadTaskIntoForm();
        }
    }

    private loadTaskIntoForm(): void {
    if (!this.task) return;

    this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        dueDate: this.task.due_date,
        priority: this.task.priority,
        category: this.task.category,
        assignedContactIds: this.task.assignedContacts.map(
        contact => contact.id
    ),
});

    const subtasks = this.taskForm.controls.subtasks;
    subtasks.clear();

    this.task.subtasks.forEach(subtask => {
    subtasks.push(
    this.formBuilder.nonNullable.control(subtask.title)
    );
});
}

    isSaving = false;

    toggleDropDown(): void {
        this.categoryDropdownOpen = false;
        this.dropdownOpen = !this.dropdownOpen;
    }

    toggleShowAllContacts(): void {
        this.showAllContacts = !this.showAllContacts;
    }

    toggleContact(contactId: string): void {
        const control = this.taskForm.controls.assignedContactIds;
        const ids = control.value;

        control.setValue(
            ids.includes(contactId) ? ids.filter(id => id !== contactId) : [...ids, contactId]
        );
    }

    toggleCategoryDropDown(): void {
        this.dropdownOpen = false;
        this.categoryDropdownOpen = !this.categoryDropdownOpen;
    }

    closeAllDropdowns(): void {
        this.dropdownOpen = false;
        this.categoryDropdownOpen = false;
    }

    selectCategory(category: string): void {
        this.taskForm.controls.category.setValue(category);
        this.categoryDropdownOpen = false;
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

        if (this.editingIndex !== null) {
            const title = this.subtaskInput.value.trim();
            const subtasks = this.taskForm.controls.subtasks;
            if (title) {
                subtasks.controls[this.editingIndex].setValue(title);
            }
            this.subtaskInput.reset();
            this.editingIndex = null;
            return;
        }

        const title = this.subtaskInput.value.trim();
        const subtasks = this.taskForm.controls.subtasks;

        if (!title || subtasks.value.includes(title)) return;
        subtasks.push(this.formBuilder.nonNullable.control(title));
        this.subtaskInput.reset();
    }

    editSubtask(index: number): void {
        const subtasks = this.taskForm.controls.subtasks;
        this.subtaskInput.setValue(subtasks.value[index]);
        this.editingIndex = index;
    }

    cancelEdit(): void {
        this.subtaskInput.reset();
        this.editingIndex = null;
    }

    removeSubtask(index: number): void {
        if (this.editingIndex === index) this.cancelEdit();
        this.taskForm.controls.subtasks.removeAt(index);
    }

    async submitForm(): Promise<void> {
        const title = this.taskForm.controls.title;

        if (!title.value.trim()) {
            title.setErrors({ required: true });
        }

        if (this.taskForm.invalid) {
            this.taskForm.markAllAsTouched();
            return;
        }
    this.isSaving = true;
    const formValue = this.taskForm.getRawValue();

    const success = this.task ? await this.taskService.updateTask(this.task.id, formValue)
    : await this.taskService.addTask(formValue);

    this.isSaving = false;
    if (!success) {
    this.contactService.triggerToast('Task could not be saved');
    return;
    }

    if (this.task) {
    this.taskUpdated.emit({
    ...this.task,
    title: formValue.title.trim(),
    description: formValue.description.trim(),
    due_date: formValue.dueDate,
    priority: formValue.priority,
    category: formValue.category as Task['category'],
    });

    this.contactService.triggerToast('Task successfully updated');
    return;
    }

    this.contactService.triggerToast('Task successfully created');
    this.taskCreated.emit();
    this.clearForm();

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

    cancelForm(): void {
        if (this.task) {
            this.cancelled.emit();
        }
        this.clearForm();
    }
}