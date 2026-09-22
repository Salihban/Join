import { inject, Injectable } from '@angular/core';
import { Supabase } from './supabase';
import { Contact } from './contact';



/**
 * Represents data for creating or updating a task.
 */
export interface NewTask {
    title: string;
    description: string;
    dueDate: string;
    priority: 'urgent' | 'medium' | 'low';
    category: string;
    status?: string;
    assignedContactIds: Array<string | number>;
    subtasks: string[];
}



/**
 * Represents a subtask entity with completion state.
 */
export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
}



/**
 * Represents a task entity with full details including subtasks and assigned contacts.
 */
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



    /**
     * Creates a new task in the database and saves its related assignees and subtasks.
     * @param task - The task data to insert.
     * @returns True if the task was saved successfully, false otherwise.
     */
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



    /**
     * Updates the completion state of a subtask.
     * @param id - The ID of the subtask to update.
     * @param completed - The new completion state.
     * @returns True if the update was successful, false otherwise.
     */
    async updateSubtaskCompleted(id: number, completed: boolean): Promise<boolean> {
        const { error } = await this.dbService.supabase.from('subtask').update({ completed }).eq('id', id);

        if (error) {
            console.error(error);
            return false;
        }
        return true;
    }



    /**
     * Updates an existing task and replaces its assignees and subtasks.
     * @param taskId - The ID of the task to update.
     * @param task - The updated task data.
     * @returns True if the task was updated successfully, false otherwise.
     */
    async updateTask(taskId: number, task: NewTask): Promise<boolean> {
        const { error } = await this.dbService.supabase.from('task').update({
            title: task.title.trim(),
            description: task.description.trim(),
            due_date: task.dueDate,
            priority: task.priority,
            category: task.category,
            ...(task.status && { status: task.status })
        }).eq('id', taskId);
        if (error) return false;
        const { error: assigneeError } = await this.dbService.supabase.from('task_assignees').delete().eq('task_id', taskId);
        const { error: subtaskError } = await this.dbService.supabase.from('subtask').delete().eq('task_id', taskId);
        if (assigneeError || subtaskError) return false;
        const assigneesSaved = await this.addTaskAssignees(taskId, task.assignedContactIds);
        const subtasksSaved = await this.addSubtasks(taskId, task.subtasks);
        return assigneesSaved && subtasksSaved;
    }



    /**
     * Updates the status of a task.
     * @param taskId - The ID of the task to update.
     * @param status - The new status value.
     * @returns True if the update was successful, false otherwise.
     */
    async updateTaskStatus(taskId: number, status: Task['status']): Promise<boolean> {
        const { error } = await this.dbService.supabase.from('task').update({ status }).eq('id', taskId);
        if (error) {
            return false;
        }
        return true;
    }



    /**
     * Deletes a task from the database.
     * @param taskId - The ID of the task to delete.
     * @returns True if the deletion was successful, false otherwise.
     */
    async deleteTask(taskId: number): Promise<boolean> {
        const { error } = await this.dbService.supabase.from('task').delete().eq('id', taskId);
        return !error;
    }



    /**
     * Saves task relations (assignees and subtasks) after inserting a new task.
     * Rolls back the task insertion if relations cannot be saved.
     * @param taskId - The ID of the newly created task.
     * @param task - The task data containing assignees and subtasks.
     * @returns True if all relations were saved successfully, false otherwise.
     */
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



    /**
     * Inserts task assignee relations for a given task.
     * @param taskId - The ID of the task.
     * @param contactIds - An array of contact IDs to assign to the task.
     * @returns True if the assignees were saved successfully, false otherwise.
     */
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



    /**
     * Inserts subtasks for a given task.
     * @param taskId - The ID of the task.
     * @param subtasks - An array of subtask titles.
     * @returns True if the subtasks were saved successfully, false otherwise.
     */
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



    /**
     * Retrieves all tasks with their subtasks and assigned contacts.
     * @returns A promise resolving to an array of Task objects.
     */
    async getTasks(): Promise<Task[]> {
        const { data, error } = await this.dbService.supabase.from('task').select(`*, subtasks:subtask!subtask_task_id_fkey(*), task_assignees(contact:contacts(*))`);
        if (error) return [];
        return (data ?? []).map((task: any) => ({
            ...task, subtasks: task.subtasks ?? [], assignedContacts: (task.task_assignees ?? []).map(
                (item: any) => item.contact),
        })) as Task[];
    }
}