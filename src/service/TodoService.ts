import { CreateTodoDTO, Todo, UpdateTodoDTO } from '../domain/Todo';

import { HTTPException } from 'hono/http-exception';
import { ITodoRepository } from '../core/ITodoRepository';
import { IUserRepository } from '../core/IUserRepository';
import { ReminderProducer } from '../app/ReminderProducer';
import { TodoValidation } from '../validation/TodoValidation';
import { User } from '../domain/User';
import { ValidationService } from '../app/ValidationService';

export class TodoService {
	constructor(
		private todoRepo: ITodoRepository,
		private userRepo: IUserRepository
	) {}

	async createTodo(data: CreateTodoDTO): Promise<Todo> {
		const createRequest: CreateTodoDTO =
			ValidationService.validate<CreateTodoDTO>(TodoValidation.CREATE, data);

		const user: User | null = await this.userRepo.findById(
			createRequest.userId
		);

		if (!user) {
			throw new HTTPException(404, { message: 'user is not found' });
		}

		const todo: Todo = await this.todoRepo.create({
			userId: user.id,
			title: data.title,
			description: data.description,
			status: 'PENDING',
			remindAt: data.remindAt ? new Date(data.remindAt) : null,
			// remindAt: new Date(Date.now() + 5000),
		});

		if (todo.remindAt) {
			const delay = Math.max(0, todo.remindAt.getTime() - Date.now());
			await ReminderProducer.send(todo.id, delay);
		}

		return todo;
	}

	async completeTodo(todoId: string): Promise<Todo> {
		const todo: Todo | null = await this.todoRepo.findById(todoId);

		if (!todo) {
			throw new HTTPException(404, { message: 'todo is not found' });
		}

		const user: User | null = await this.userRepo.findById(todo.userId);

		if (!user) {
			throw new HTTPException(404, { message: 'user is not found' });
		}

		if (todo.status === 'DONE') {
			return todo;
		}

		const timeNow: Date = new Date(
			Math.max(Date.now(), todo.updatedAt.getTime() + 1)
		);

		const updated = await this.todoRepo.update(todoId, {
			status: 'DONE',
			updatedAt: timeNow,
		});

		if (!updated) {
			throw new HTTPException(400, { message: 'failed to complete todo' });
		}

		return updated;
	}

	async getTodosByUser(userId: string): Promise<Todo[]> {
		const user = await this.userRepo.findById(userId);

		if (!user) {
			throw new HTTPException(404, {
				message: 'user is not found',
			});
			// throw new Error('user not found');
		}

		const todos = await this.todoRepo.findByUserId(userId);

		return todos;
	}

	async getTodoById(todoId: string): Promise<Todo> {
		const todo = await this.todoRepo.findById(todoId);

		if (!todo) {
			throw new HTTPException(404, { message: 'todo is not found' });
		}

		return todo;
	}

	async processReminders(): Promise<number> {
		/**
     * Reminder Behavior

    PENDING + remindAt <= now → should become REMINDER_DUE when processed.
    DONE todos should not be affected by reminder processing.
    Reminder processing is run periodically by a scheduler.

     */
		const now: Date = new Date();

		/**
		 * @deprecated
		 * is not used because perform query every loop
		 * for now we use map even thought for loop and map is the same iterator
		 * map is used just for mimic update many from prisma orm behaviour
		 *
		 
		const dueTodos: Todo[] = await this.todoRepo.findDueReminders(now);
		
		for (const todo of dueTodos) {
			if (todo.status !== 'PENDING') {
				continue;
			}
			
			// This should only process PENDING todos, but doesn't check
			await this.todoRepo.update(todo.id, {
				status: 'REMINDER_DUE',
				updatedAt: new Date(),
			});
		}
		*/

		const markManyDueTodos: number = await this.todoRepo.markRemindersDue(now);
		return markManyDueTodos;
	}

	async update(request: UpdateTodoDTO): Promise<Todo> {
		const updateRequest: UpdateTodoDTO = ValidationService.validate(
			TodoValidation.UPDATE,
			request
		);

		const todo: Todo | null = await this.todoRepo.findById(updateRequest.id);

		if (!todo) {
			throw new HTTPException(404, { message: 'todo is not found' });
		}

		const user: User | null = await this.userRepo.findById(
			updateRequest.userId
		);

		if (!user) {
			throw new HTTPException(404, { message: 'user is not found' });
		}

		if (user.id !== todo.userId) {
			throw new HTTPException(403, {
				message: 'cant update todo with this user',
			});
		}

		const updateTodo: Todo | null = await this.todoRepo.update(
			updateRequest.id,
			{
				title: updateRequest.title ?? todo.title,
				description: updateRequest.description ?? todo.description,
				status: updateRequest.status ?? todo.status,
				remindAt:
					(updateRequest.remindAt ? new Date(updateRequest.remindAt) : null) ??
					todo.remindAt,
			}
		);

		if (updateRequest.remindAt) {
			const newDelay = Math.max(
				0,
				new Date(updateRequest.remindAt).getTime() - Date.now()
			);
			await ReminderProducer.send(updateRequest.id, newDelay);
		}

		if (!updateTodo) {
			throw new HTTPException(400, { message: 'failed update todo' });
		}

		return updateTodo;
	}

	async remove(todoId: string): Promise<boolean> {
		const todo: Todo = await this.getTodoById(todoId);

		const removeTodo = this.todoRepo.update(todo.id, {
			deletedAt: new Date(),
		});

		if (!removeTodo) {
			throw new HTTPException(400, { message: 'failed to remove todo' });
		}

		return true;
	}

	async markReminderDue(todoId: string) {
		const todo = await this.todoRepo.findById(todoId);
		if (!todo) {
			return;
		}

		if (todo.status !== 'PENDING') {
			return;
		}

		if (!todo.remindAt) {
			return;
		}

		if (todo.remindAt > new Date()) {
			return;
		}

		await this.todoRepo.update(todoId, {
			status: 'REMINDER_DUE',
			updatedAt: new Date(),
		});
	}
}
