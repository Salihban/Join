import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDropListGroup, CdkDrag } from '@angular/cdk/drag-drop';
import { TaskService, Task, NewTask } from '../../services/task';
import { TaskDetails } from '../../components/task-details/task-details';
import { TaskCard } from '../../components/task-card/task-card';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TaskOverlay } from '../../components/task-overlay/task-overlay';
import { ContactService } from '../../services/contact';


@Component({
    selector: 'app-board',
    standalone: true,
    imports: [CdkDropList, CdkDropListGroup, CdkDrag, TaskCard, TaskDetails],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board implements OnInit {
    todoTasks = signal<Task[]>([]);
    inProgressTasks = signal<Task[]>([]);
    awaitFeedbackTasks = signal<Task[]>([]);
    doneTasks = signal<Task[]>([]);
    selectedTask = signal<Task | null>(null);
    searchTerm = signal('');
    activeTaskId = signal<number | null>(null);
    private allTasks = signal<Task[]>([]);
    private taskService = inject(TaskService);
    private dialog = inject(MatDialog);
    private router = inject(Router);
    private contactService = inject(ContactService);



    /**
     * Initializes the component by loading all tasks.
     */
    async ngOnInit(): Promise<void> {
        await this.loadTasks();
    }



    /**
     * Toggles the visibility of a task's context menu.
     * @param taskId - The ID of the task whose menu should be toggled.
     * @param event - Optional click event to stop propagation.
     */
    toggleTaskMenu(taskId: number, event?: Event): void {
        event?.stopPropagation();
        this.activeTaskId.update((current) => (current === taskId ? null : taskId));
    }



    /**
     * Closes any open task menu when clicking outside the component.
     */
    @HostListener('document:click')
    closeActiveMenu(): void {
        this.activeTaskId.set(null);
    }



    /**
     * Loads all tasks from the service and distributes them into status-based signals.
     */
    async loadTasks(): Promise<void> {
        try {
            const allTasks = await this.taskService.getTasks();
            this.allTasks.set(allTasks ?? []);
            this.filterTasksByStatus(allTasks ?? []);
        } catch (error) {
            console.error('[Board] Fehler beim Laden der Tasks:', error);
        }
    }



    /**
     * Updates a task's status and reloads the task list if successful.
     * @param event - Object containing the task ID and new status.
     */
    async onStatusChanged(event: { taskId: number; status: Task['status'] }): Promise<void> {
        this.activeTaskId.set(null);
        const success = await this.taskService.updateTaskStatus(event.taskId, event.status);
        if (success) {
            await this.loadTasks();
        }
    }



    /**
     * Filters tasks based on a search term entered by the user.
     * @param event - Input event containing the search term.
     */
    onSearch(event: Event): void {
        const input = event.target as HTMLInputElement;
        const searchTerm = input.value.trim();
        this.searchTerm.set(searchTerm);
        const allTasks = this.allTasks();
        if (searchTerm.length < 3) {
            this.filterTasksByStatus(allTasks);
            return;
        }


        const search = searchTerm.toLowerCase();
        const filteredTasks = allTasks.filter((task) => {
            const title = (task.title ?? '').toLowerCase();
            const description = (task.description ?? '').toLowerCase();
            return title.includes(search) || description.includes(search);
        });
        this.filterTasksByStatus(filteredTasks);
    }



    /**
     * Checks whether the current search term yields visible results.
     * @returns True if there are results or the search term is too short to filter.
     */
    hasSearchResults(): boolean {
        if (this.searchTerm().length < 3) {
            return true;
        }
        return (
            this.todoTasks().length > 0 ||
            this.inProgressTasks().length > 0 ||
            this.awaitFeedbackTasks().length > 0 ||
            this.doneTasks().length > 0
        );
    }



    /**
     * Distributes tasks into status-based signals (todo, in progress, await feedback, done).
     * @param allTasks - The full list of tasks to filter.
     */
    private filterTasksByStatus(allTasks: Task[]): void {
        this.todoTasks.set(allTasks.filter((t) => (t.status as string) === 'todo'));
        this.inProgressTasks.set(
            allTasks.filter(
                (t) =>
                    (t.status as string) === 'in_progress' || (t.status as string) === 'inProgress',
            ),
        );
        this.awaitFeedbackTasks.set(
            allTasks.filter(
                (t) =>
                    (t.status as string) === 'await_feedback' ||
                    (t.status as string) === 'awaitFeedback',
            ),
        );
        this.doneTasks.set(allTasks.filter((t) => (t.status as string) === 'done'));
    }



    /**
     * Opens the dialog or route for adding a new task, depending on screen size.
     */
    openAddTaskDialog(): void {
        if (window.innerWidth < 768) {
            this.router.navigate(['/add-task']);
            return;
        }
        this.dialog
            .open(TaskOverlay, {
                width: '1200px',
                maxWidth: '90dvh',
                height: 'auto',
                maxHeight: '120dvh',
                panelClass: 'task-dialog-panel',
            })
            .afterClosed()
            .subscribe((result) => {
                if (result) {
                    this.loadTasks();
                }
            });
    }



    /**
     * Handles dropping a task into a new or existing column.
     * Updates the UI and persists the new status if the task moved between columns.
     * @param event - Drag-and-drop event containing task and container information.
     */
    async drop(event: CdkDragDrop<Task[]>): Promise<void> {
        const movedTask = event.item.data as Task;
        if (!movedTask) {
            return;
        }
        if (event.previousContainer === event.container) {
            this.updateListSignal(event.container.id, (currentList) => {
                const list = [...currentList];
                const [item] = list.splice(event.previousIndex, 1);
                list.splice(event.currentIndex, 0, item);
                return list;
            });
        } else {
            this.updateListSignal(event.previousContainer.id, (currentList) =>
                currentList.filter((t) => t.id !== movedTask.id),
            );
            const newStatus = this.getStatusFromContainerId(event.container.id);
            if (newStatus) {
                movedTask.status = newStatus as any;
            }
            this.updateListSignal(event.container.id, (currentList) => {
                const list = [...currentList];
                list.splice(event.currentIndex, 0, movedTask);
                return list;
            });


            if (newStatus && movedTask.id) {
                const updatedTaskPayload: NewTask = {
                    title: movedTask.title ?? '',
                    description: movedTask.description ?? '',
                    dueDate: movedTask.due_date ?? '',
                    priority: movedTask.priority ?? 'medium',
                    category: movedTask.category ?? 'technical_task',
                    status: newStatus,
                    assignedContactIds: movedTask.assignedContacts
                        ? movedTask.assignedContacts.map((c: any) => c.id)
                        : [],
                    subtasks: movedTask.subtasks ? movedTask.subtasks.map((s: any) => s.title) : [],
                };

                try {
                    await this.taskService.updateTask(movedTask.id, updatedTaskPayload);
                } catch (error) {
                    console.error('[Board] Fehler beim Speichern', error);
                }
            }
        }
    }



    /**
     * Updates the appropriate task list signal based on the container ID.
     * @param containerId - The ID of the drop list container.
     * @param updateFn - Function that transforms the current task list.
     */
    private updateListSignal(containerId: string, updateFn: (tasks: Task[]) => Task[]): void {
        switch (containerId) {
            case 'todoList':
                this.todoTasks.update(updateFn);
                break;
            case 'inProgressList':
                this.inProgressTasks.update(updateFn);
                break;
            case 'awaitFeedbackList':
                this.awaitFeedbackTasks.update(updateFn);
                break;
            case 'doneList':
                this.doneTasks.update(updateFn);
                break;
        }
    }



    /**
     * Maps a drop list container ID to its corresponding task status string.
     * @param containerId - The ID of the drop list container.
     * @returns The status string or null if the container ID is unknown.
     */
    private getStatusFromContainerId(containerId: string): string | null {
        switch (containerId) {
            case 'todoList':
                return 'todo';
            case 'inProgressList':
                return 'in_progress';
            case 'awaitFeedbackList':
                return 'await_feedback';
            case 'doneList':
                return 'done';
            default:
                return null;
        }
    }



    /**
     * Removes a task from the list and triggers a success toast.
     * @param taskId - The ID of the task to delete.
     */
    onTaskDelete(taskId: number): void {
        this.allTasks.update((tasks) => tasks.filter((task) => task.id !== taskId));
        this.filterTasksByStatus(this.allTasks());
        this.selectedTask.set(null);
        this.contactService.triggerToast('Task delete successful');
    }



    /**
     * Signal indicating whether the current viewport is considered mobile.
     */
    isMobile = signal(window.innerWidth < 1025);


    
    /**
     * Updates the mobile viewport flag when the window is resized.
     */
    @HostListener('window:resize')
    checkScreenSize(): void {
        this.isMobile.set(window.innerWidth < 1025);
    }
}