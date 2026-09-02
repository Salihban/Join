import { inject, Injectable } from '@angular/core';
import { Supabase } from './supabase';
import { Contact } from './contact';

    export interface NewTask {
        title: string;
        description: string;
        dueDate: string;
        priority: 'urgent' | 'medium' | 'low';
        category: string;
        assignedContactIds: Array<string | number>;
        subtasks: string[];
    }

    export interface Subtask {
        id: number;
        title: string;
        completed: boolean;
    }

    export interface Task {
        id: number;
        title: string;
        description: string;
        due_date: string;
        priority: 'urgent' | 'medium' | 'low';
        category: 'technical_task' | 'user_story';
        status: 'todo' | 'in_progress' | 'await_feedback' | 'done';
        subtasks: Subtask[];
        assignedContacts: Contact[];
    }

    @Injectable({
        providedIn: 'root'
    })

    export class TaskService {
        private dbService = inject(Supabase);

    async addTask(task: NewTask): Promise<boolean> {
        const { data, error } = await this.dbService.supabase.from('task').insert({
        title: task.title.trim(),
        description: task.description.trim(),
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
        status: 'todo'
        }).select('id').single();

    if (error || !data) {
        console.error('Task konnte nicht gespeichert werden:', error);
        return false;
    }
    return this.saveTaskRelations(data.id, task);
    }

    async updateTask(taskId: number, task: NewTask): Promise<boolean> {
    const { error } = await this.dbService.supabase.from('task').update({
        title: task.title.trim(),
        description: task.description.trim(),
        due_date: task.dueDate,
        priority: task.priority,
        category: task.category,
    }).eq('id', taskId);
    return !error;
}

    async deleteTask(taskId: number): Promise<boolean> {
    const { error } = await this.dbService.supabase.from('task').delete().eq('id', taskId);
    return !error;
}

    private async saveTaskRelations(
        taskId: number,
        task: NewTask
    ): Promise<boolean> {
        const assigneesSaved = await this.addTaskAssignees(
        taskId, task.assignedContactIds
    );

    const subtasksSaved = await this.addSubtasks(
        taskId, task.subtasks
    );

    if (!assigneesSaved || !subtasksSaved) {
    await this.dbService.supabase.from('task').delete().eq('id', taskId);

    return false;
    }
    return true;
    }

    private async addTaskAssignees(
    taskId: number, contactIds: Array<string | number>
    ): Promise<boolean> {
    if (!contactIds.length) return true;

    const rows = contactIds.map(contactId => ({
    task_id: taskId, contact_id: contactId
    }));

    const { error } = await this.dbService.supabase.from('task_assignees').insert(rows);
    return !error;
    }

    private async addSubtasks(
    taskId: number, subtasks: string[]
    ): Promise<boolean> {
    if (!subtasks.length) return true;

    const rows = subtasks.map(title => ({
    task_id: taskId, title, completed: false
    }));

    const { error } = await this.dbService.supabase.from('subtask').insert(rows);
    return !error;
    }
}