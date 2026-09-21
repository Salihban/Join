import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Supabase } from '../../services/supabase';
import { Task, TaskService } from '../../services/task';
import { AuthService } from '../../services/auth';
import { RouterLink } from '@angular/router';


@Component({
    imports: [CommonModule, RouterLink],
    standalone: true,
    selector: 'app-summary',
    styleUrl: './summary.scss',
    templateUrl: './summary.html',
})
export class Summary implements OnInit, OnDestroy{
    private taskService = inject(TaskService);
    private dbService = inject(Supabase);
    private realtimeChannel?: RealtimeChannel;
    private authService = inject(AuthService);
    greeting = this.getGreeting();
    task = signal<Task[]>([]);
    totalTasks = computed(() => this.task().length);


    todoTasks = computed(() => this.task().filter((task) => task.status === 'todo').length);
    inProgressTasks = computed(() => this.task().filter((task) => task.status === 'in_progress').length);
    feedbackTasks = computed(() => this.task().filter((task) => task.status === 'await_feedback').length);
    doneTasks = computed(() => this.task().filter((task) => task.status === 'done').length);
    urgentTasks = computed(() => this.task().filter((task) => task.priority === 'urgent').length);


    nextUrgentTask = computed(() => {

        return [...this.task()].filter((task) => task.priority === 'urgent')
        .sort((a, b) => a.due_date.localeCompare(b.due_date))[0] ?? null;
    });



    /**
     * Initializes the component by loading tasks and subscribing to real-time task changes.
     * @returns void
     */
    async ngOnInit(): Promise<void> {
        await this.loadTasks();
        this.subscribeToTask();
    }



    /**
     * Loads all tasks from the task service and updates the task signal.
     * @returns void
     */
    private async loadTasks(): Promise<void> {
        const task = await this.taskService.getTasks();
        this.task.set(task);
    }



    /**
     * Subscribes to real-time changes on the task table to automatically reload tasks on updates.
     * @returns void
     */
    private subscribeToTask(): void {
        this.realtimeChannel = this.dbService.supabase.channel('summary-task-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'task'
        }, () => void this.loadTasks()).subscribe();
    }



    /**
     * Cleans up the real-time subscription when the component is destroyed.
     * @returns void
     */
    ngOnDestroy(): void {
        if (this.realtimeChannel) {
            void this.dbService.supabase.removeChannel(this.realtimeChannel);
        }
    }



    /**
     * Computes the current user's name for display, returning 'Guest!' for anonymous or unauthenticated users.
     * @returns The user's name or 'Guest!' if not available.
     */
    userName = computed(() => {
        const user = this.authService.currentUser();
        if (!user || user.is_anonymous) {
            return 'Guest!';
        }
        return user.user_metadata?.['name'] ?? '';
    });



    /**
     * Returns a time-based greeting string based on the current hour.
     * @returns 'Good morning' before noon, 'Good afternoon' before 6 PM, or 'Good evening' otherwise.
     */
    private getGreeting(): string {
        const hour = new Date().getHours();


        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }
}