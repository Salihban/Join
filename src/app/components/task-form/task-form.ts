import { Component, computed, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Contact, ContactService } from '../../services/contact';
import { TaskService, Task } from '../../services/task';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';


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
    readonly sortedContacts = computed(() => {
        const alphabeticalContacts = [...this.contacts()].sort(
            (a, b) => a.name.localeCompare(b.name));
        return this.contactService.currentUserFirst(alphabeticalContacts);
    });
    subtaskInput = this.formBuilder.nonNullable.control('');
    dropdownOpen = false;
    categoryDropdownOpen = false;
    showAllContacts = false;
    editingIndex: number | null = null;
    private router = inject(Router);


    @Input() task?: Task;
    @Input() detailsModus = false;
    @Output() taskCreated = new EventEmitter<void>();
    @Output() taskUpdated = new EventEmitter<Task>();
    @Output() cancelled = new EventEmitter<void>();



    /**
     * Initializes the component by loading contacts and populating the form if editing an existing task.
     */
    ngOnInit(): void {
        this.contactService.getContacts();


        if (this.task) {
            this.loadTaskIntoForm();
        }
    }



    /**
     * Populates the form fields with data from an existing task for editing.
     * Clears and rebuilds the subtasks form array to match the task's subtasks.
     */
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



    /**
     * Toggles the visibility of the contacts dropdown and closes the category dropdown.
     */
    toggleDropDown(): void {
        this.categoryDropdownOpen = false;
        this.dropdownOpen = !this.dropdownOpen;
    }



    /**
     * Toggles between showing all contacts and a limited subset in the dropdown.
     */
    toggleShowAllContacts(): void {
        this.showAllContacts = !this.showAllContacts;
    }



    /**
     * Toggles a contact's selection state in the assigned contacts list.
     * @param contactId - The ID of the contact to toggle.
     */
    toggleContact(contactId: string): void {
        const control = this.taskForm.controls.assignedContactIds;
        const ids = control.value;


        control.setValue(
            ids.includes(contactId) ? ids.filter(id => id !== contactId) : [...ids, contactId]
        );
    }



    /**
     * Toggles the visibility of the category dropdown and closes the contacts dropdown.
     */
    toggleCategoryDropDown(): void {
        this.dropdownOpen = false;
        this.categoryDropdownOpen = !this.categoryDropdownOpen;
    }



    /**
     * Closes all open dropdowns (contacts and category).
     */
    closeAllDropdowns(): void {
        this.dropdownOpen = false;
        this.categoryDropdownOpen = false;
    }



    /**
     * Sets the selected category and closes the category dropdown.
     * @param category - The category value to select.
     */
    selectCategory(category: string): void {
        this.taskForm.controls.category.setValue(category);
        this.categoryDropdownOpen = false;
    }



    /**
     * Checks whether a contact is currently selected in the form.
     * @param contactId - The ID of the contact to check.
     * @returns True if the contact is selected, false otherwise.
     */
    isSelected(contactId: string): boolean {
        return this.taskForm.controls.assignedContactIds.value.includes(contactId);
    }



    /**
     * Returns the list of contacts currently selected in the form.
     * @returns An array of selected Contact objects.
     */
    get selectContacts(): Contact[] {
        const ids = this.taskForm.controls.assignedContactIds.value;

        return this.contacts().filter(contact => ids.includes(contact.id));
    }


    taskForm = this.formBuilder.nonNullable.group({
        title: ['', [Validators.required, Validators.minLength(3)]],
        description: [''],
        dueDate: ['', [Validators.required, this.noPastDateValidator()]],
        priority: ['medium' as Priority],
        assignedContactIds: this.formBuilder.nonNullable.control<string[]>([]),
        category: ['', Validators.required],
        subtasks: this.formBuilder.array<FormControl<string>>([])
    });


    priorities: Priority[] = ['urgent', 'medium', 'low'];



    /**
     * Sets the selected priority value in the form.
     * @param priority - The priority level to select.
     */
    setPriority(priority: Priority): void {
        this.taskForm.controls.priority.setValue(priority);
    }



    /**
     * Adds a new subtask or updates an existing one being edited.
     * Prevents duplicate subtasks and ignores empty input.
     * @param event - Optional event to prevent default form submission behavior.
     */
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



    /**
     * Begins editing an existing subtask by loading its value into the input field.
     * @param index - The index of the subtask to edit.
     */
    editSubtask(index: number): void {
        const subtasks = this.taskForm.controls.subtasks;
        this.subtaskInput.setValue(subtasks.value[index]);
        this.editingIndex = index;
    }



    /**
     * Cancels the current subtask edit and resets the input field.
     */
    cancelEdit(): void {
        this.subtaskInput.reset();
        this.editingIndex = null;
    }



    /**
     * Removes a subtask from the form at the specified index.
     * Cancels any active edit if the removed subtask is being edited.
     * @param index - The index of the subtask to remove.
     */
    removeSubtask(index: number): void {
        if (this.editingIndex === index) this.cancelEdit();
        this.taskForm.controls.subtasks.removeAt(index);
    }



    /**
     * Validates and submits the form to create or update a task.
     * Displays appropriate toast messages and emits events based on the result.
     */
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
                assignedContacts: [...this.selectContacts],
                subtasks: (formValue.subtasks ?? []).map((title, index) => ({
                    id: this.task!.subtasks[index]?.id ?? Date.now() + index,
                    title: title,
                    completed: this.task!.subtasks[index]?.completed ?? false,
                })),
            });

            this.contactService.triggerToast('Task successfully updated');
            return;
        }

        this.contactService.triggerToast('Task successfully created');
        this.taskCreated.emit();
        this.clearForm();


        if (this.router.url === '/add-task') {
            await this.router.navigate(['/board']);
        }
    }



    /**
     * Resets all form fields to their initial empty state.
     * Clears the subtasks array and resets the subtask input field.
     */
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



    /**
     * Cancels the form action, either emitting a cancelled event in details mode or clearing the form.
     */
    cancelForm(): void {
        if (this.detailsModus && this.task) {
            this.cancelled.emit();
            return;
        }
        this.clearForm();
    }


    
    /**
     * Creates a validator that prevents selecting past dates for the due date field.
     * @returns A validator function that returns a pastDate error if the date is in the past.
     */
    private noPastDateValidator(): ValidatorFn {
        return (control: AbstractControl) => {
            if (!control.value || this.task) return null;
            const selected = new Date(control.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return selected < today ? { pastDate: true } : null;
        };
    }
}