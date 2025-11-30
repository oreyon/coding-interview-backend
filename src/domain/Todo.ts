export type TodoStatus = 'PENDING' | 'DONE' | 'REMINDER_DUE';

export interface Todo {
	id: string;
	userId: string;
	title: string;
	description?: string;
	status: TodoStatus;
	createdAt: Date;
	updatedAt: Date;
	remindAt?: Date | null;
	deletedAt?: Date;
}

export interface CreateTodoDTO {
	userId: string;
	title: string;
	description?: string;
	// string ISO 8601 date format
	remindAt?: string | null;
}

export interface UpdateTodoDTO {
	id: string;
	userId: string;
	title?: string;
	status: TodoStatus;
	description?: string;
	remindAt?: string | null;
	deletedAt?: Date;
}
