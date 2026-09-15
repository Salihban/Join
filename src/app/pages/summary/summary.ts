import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Supabase } from '../../services/supabase';
import { Task, TaskService } from '../../services/task';

@Component({
    imports: [CommonModule],
    standalone: true,
    selector: 'app-summary',
    styleUrl: './summary.scss',
    templateUrl: './summary.html',
})
export class Summary implements OnInit, OnDestroy{
    private taskService = inject(TaskService);
    private dbService = inject(Supabase);
    private realtimeChannel?: RealtimeChannel;
    task = signal<Task[]>([]);
    totalTasks = computed(() => this.task().length);

    todoTasks = computed(() => this.task().filter((task) => task.status === 'todo').length);
    inProgressTasks = computed(() => this.task().filter((task) => task.status === 'in_progress').length);
    feedbackTasks = computed(() => this.task().filter((task) => task.status === 'await_feedback').length);
    doneTasks = computed(() => this.task().filter((task) => task.status === 'done').length);
    urgentTasks = computed(() => this.task().filter((task) => task.priority === 'urgent').length);

    nextUrgentTask = computed(() => {
    const today = new Date().toISOString().slice(0,10);

    return [...this.task()].filter((task) => task.priority === 'urgent' &&
    task.due_date >= today).sort((a, b) => a.due_date.localeCompare(b.due_date))[0]?? null;
    });

    async ngOnInit():Promise<void> {
        await this.loadTasks();
        this.subscribeToTask();
    }

    private async loadTasks(): Promise<void> {
        const task = await this.taskService.getTasks();
        this.task.set(task);
    }

    private subscribeToTask(): void {
        this.realtimeChannel = this.dbService.supabase.channel('summary-task-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'task'
        }, () => void this.loadTasks()).subscribe();
    }

    ngOnDestroy(): void {
        if (this.realtimeChannel) {
            void this.dbService.supabase.removeChannel(this.realtimeChannel);
        }
    }
}