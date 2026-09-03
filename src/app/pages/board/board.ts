import { Component, inject, OnInit, signal } from '@angular/core';
import { NewTask, Task, TaskService } from '../../services/task';
import { TaskCard } from '../../components/task-card/task-card';
import { TaskDetails } from '../../components/task-details/task-details';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-board',
    standalone: true,
    imports: [TaskCard, TaskDetails, DragDropModule],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board implements OnInit {
    todoTasks = signal<Task[]>([]);
    inProgressTasks = signal<Task[]>([]);
    awaitFeedbackTasks = signal<Task[]>([]);
    doneTasks = signal<Task[]>([]);

    private taskService = inject(TaskService);
    selectedTask = signal<Task | null>(null);

    async ngOnInit(): Promise<void> {
        await this.loadTasks();
    }

    async loadTasks(): Promise<void> {
        const allTasks = await this.taskService.getTasks();
        this.filterTasksByStatus(allTasks);
    }

    private filterTasksByStatus(allTasks: Task[]): void {
        this.todoTasks.set(allTasks.filter(t => (t.status as string) === 'todo'));
        this.inProgressTasks.set(allTasks.filter(t => (t.status as string) === 'in_progress' || (t.status as string) === 'inProgress'));
        this.awaitFeedbackTasks.set(allTasks.filter(t => (t.status as string) === 'await_feedback' || (t.status as string) === 'awaitFeedback'));
        this.doneTasks.set(allTasks.filter(t => (t.status as string) === 'done'));
    }

    async drop(event: CdkDragDrop<Task[]>): Promise<void> {
        if (event.previousContainer === event.container) {
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );

            const movedTask = event.container.data[event.currentIndex];
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
                    console.error('Speichern fehlgeschlagen! Lade Aufgaben neu...');
                    await this.loadTasks();
                }
            } else {
                console.warn('Task ID oder Status konnte nicht ermittelt werden.');
            }
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