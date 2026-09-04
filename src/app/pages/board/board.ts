import { Component, inject, OnInit, signal } from '@angular/core';
import { CdkDragDrop, CdkDropList, CdkDropListGroup, CdkDrag, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
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

    private taskService = inject(TaskService);

    async ngOnInit(): Promise<void> {
        await this.loadTasks();
    }

    async loadTasks(): Promise<void> {
        const allTasks = await this.taskService.getTasks();
        this.filterTasksByStatus(allTasks ?? []);
    }

    private filterTasksByStatus(allTasks: Task[]): void {
        this.todoTasks.set(allTasks.filter(t => (t.status as string) === 'todo'));
        this.inProgressTasks.set(allTasks.filter(t => (t.status as string) === 'in_progress' || (t.status as string) === 'inProgress'));
        this.awaitFeedbackTasks.set(allTasks.filter(t => (t.status as string) === 'await_feedback' || (t.status as string) === 'awaitFeedback'));
        this.doneTasks.set(allTasks.filter(t => (t.status as string) === 'done'));
    }

    async drop(event: CdkDragDrop<Task[]>): Promise<void> {
        if (event.previousContainer === event.container) {
            const currentList = [...event.container.data];
            moveItemInArray(currentList, event.previousIndex, event.currentIndex);
            this.setSignalByContainerId(event.container.id, currentList);
        } else {
            const prevList = [...event.previousContainer.data];
            const currentList = [...event.container.data];

            transferArrayItem(
                prevList,
                currentList,
                event.previousIndex,
                event.currentIndex
            );

            this.setSignalByContainerId(event.previousContainer.id, prevList);
            this.setSignalByContainerId(event.container.id, currentList);

            const movedTask = currentList[event.currentIndex];
            const newStatus = this.getStatusFromContainerId(event.container.id);

            if (newStatus && movedTask?.id) {
                movedTask.status = newStatus as any;

                const updatedTaskPayload: NewTask = {
                    title: movedTask.title ?? '',
                    description: movedTask.description ?? '',
                    dueDate: movedTask.due_date ?? '',
                    priority: movedTask.priority ?? 'medium',
                    category: movedTask.category ?? 'technical_task',
                    status: newStatus,
                    assignedContactIds: movedTask.assignedContacts ? movedTask.assignedContacts.map(c => c.id) : [],
                    subtasks: movedTask.subtasks ? movedTask.subtasks.map(s => s.title) : []
                };

                const success = await this.taskService.updateTask(movedTask.id, updatedTaskPayload);

                if (!success) {
                    await this.loadTasks();
                }
            }
        }
    }

    private setSignalByContainerId(containerId: string, newList: Task[]): void {
        switch (containerId) {
            case 'todoList':
                this.todoTasks.set(newList);
                break;
            case 'inProgressList':
                this.inProgressTasks.set(newList);
                break;
            case 'awaitFeedbackList':
                this.awaitFeedbackTasks.set(newList);
                break;
            case 'doneList':
                this.doneTasks.set(newList);
                break;
        }
    }

    private getStatusFromContainerId(containerId: string): string | null {
        switch (containerId) {
            case 'todoList': return 'todo';
            case 'inProgressList': return 'in_progress';
            case 'awaitFeedbackList': return 'await_feedback';
            case 'doneList': return 'done';
            default: return null;
        }
    }
}