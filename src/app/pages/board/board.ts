import { Component, inject, OnInit, signal } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDropListGroup, CdkDrag } from '@angular/cdk/drag-drop';
import { TaskService, Task, NewTask } from '../../services/task';
import { TaskDetails } from '../../components/task-details/task-details';
import { TaskCard } from '../../components/task-card/task-card';

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

    private allTasks = signal<Task[]>([]);
    private taskService = inject(TaskService);

    async ngOnInit(): Promise<void> {
        await this.loadTasks();
    }

    async loadTasks(): Promise<void> {
        try {
            const allTasks = await this.taskService.getTasks();

            this.allTasks.set(allTasks ?? []);
            this.filterTasksByStatus(allTasks ?? []);
        } catch (error) {
            console.error('[Board] Fehler beim Laden der Tasks:', error);
        }
    }

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
        const filteredTasks = allTasks.filter(task => {
            const title = (task.title ?? '').toLowerCase();
            const description = (task.description ?? '').toLowerCase();
            return title.includes(search) || description.includes(search);
        });
        this.filterTasksByStatus(filteredTasks);
    }

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

    private filterTasksByStatus(allTasks: Task[]): void {
        this.todoTasks.set(
            allTasks.filter(t => (t.status as string) === 'todo')
        );

        this.inProgressTasks.set(
            allTasks.filter(
                t =>
                    (t.status as string) === 'in_progress' ||
                    (t.status as string) === 'inProgress'
            )
        );

        this.awaitFeedbackTasks.set(
            allTasks.filter(
                t =>
                    (t.status as string) === 'await_feedback' ||
                    (t.status as string) === 'awaitFeedback'
            )
        );

        this.doneTasks.set(
            allTasks.filter(t => (t.status as string) === 'done')
        );
    }

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
                currentList.filter(t => t.id !== movedTask.id)
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
                    assignedContactIds: movedTask.assignedContacts ? movedTask.assignedContacts.map((c: any) => c.id) : [],
                    subtasks: movedTask.subtasks ? movedTask.subtasks.map((s: any) => s.title) : []
                };

                try {
                    await this.taskService.updateTask(
                        movedTask.id,
                        updatedTaskPayload
                    );
                } catch (error) {
                    console.error('[Board] Fehler beim Speichern', error);
                }
            }
        }
    }

    private updateListSignal(
        containerId: string,
        updateFn: (tasks: Task[]) => Task[]
    ): void {
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
}

