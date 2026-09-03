import { Component, inject, OnInit, signal } from '@angular/core';
import { Task, TaskService } from '../../services/task';
import { TaskCard } from '../../components/task-card/task-card';

@Component({
    selector: 'app-board',
    imports: [TaskCard],
    templateUrl: './board.html',
    styleUrl: './board.scss',
})
export class Board implements OnInit{
    tasks = signal<Task[]>([]);
    private taskService = inject(TaskService);

    async ngOnInit(): Promise<void> {
        this.tasks.set(await this.taskService.getTasks());
    }
}