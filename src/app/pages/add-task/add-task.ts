import { Component } from '@angular/core';
import { TaskForm } from '../../components/task-form/task-form';

@Component({
    selector: 'app-add-task',
    standalone: true,
    imports: [TaskForm],
    templateUrl: './add-task.html',
    styleUrl: './add-task.scss',
})
export class AddTask {}
