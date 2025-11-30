import { ITodoRepository } from '../core/ITodoRepository';
import { Todo } from '../domain/Todo';

export class InMemoryTodoRepository implements ITodoRepository {
	private todos: Todo[] = [];

	async create(
		todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Todo> {
		const id = `todo-${Math.floor(Math.random() * 1000000)}`;
		const now = new Date();

		const todo: Todo = {
			...todoData,
			id,
			createdAt: now,
			updatedAt: now,
		};

		this.todos.push(todo);
		return todo;
	}

	async update(
		id: string,
		updates: Partial<Omit<Todo, 'id' | 'userId' | 'createdAt'>>
	): Promise<Todo | null> {
		const index = this.todos.findIndex((t) => t.id === id);

		if (index === -1) {
			const newTodo: Todo = {
				id,
				userId: (updates as any).userId || 'unknown',
				title: (updates as any).title || 'Untitled',
				status: updates.status || 'PENDING',
				createdAt: new Date(),
				updatedAt: new Date(),
				...updates,
			};
			this.todos.push(newTodo);
			return newTodo;
		}

		this.todos[index] = {
			...this.todos[index],
			...updates,
			updatedAt: updates.updatedAt ?? new Date(),
		};

		return this.todos[index];
	}

	async findById(id: string): Promise<Todo | null> {
		const todo = this.todos.find(
			(t: Todo): boolean => t.id === id
			// && t.deletedAt !== undefined
		);
		return todo || null;
	}

	async findByUserId(userId: string): Promise<Todo[]> {
		return this.todos.filter(
			(t: Todo): boolean => t.userId === userId
			// && t.deletedAt !== undefined
		);
	}

	async findDueReminders(currentTime: Date): Promise<Todo[]> {
		return this.todos.filter(
			(t: Todo): boolean | null | undefined =>
				t.status === 'PENDING' &&
				t.remindAt instanceof Date &&
				t.remindAt.getTime() <= currentTime.getTime()
			// && t.deletedAt !== undefined
		);
	}

	async markRemindersDue(currentTIme: Date): Promise<number> {
		let updateCount: number = 0;

		this.todos = this.todos.map((todo: Todo) => {
			const isDueTime: boolean =
				todo.status === 'PENDING' &&
				todo.remindAt instanceof Date &&
				todo.remindAt.getTime() <= currentTIme.getTime();

			if (!isDueTime) {
				return todo;
			}

			updateCount++;

			return {
				...todo,
				status: 'REMINDER_DUE',
				updatedAt: new Date(),
			};
		});

		return updateCount;
	}
}
