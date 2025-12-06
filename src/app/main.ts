import { Collaboration, CreateCollaborationDTO } from '../domain/Collaboration';
import { Context, Hono } from 'hono';
import { CreateTodoDTO, Todo, UpdateTodoDTO } from '../domain/Todo';
import { CreateUserDTO, User } from '../domain/User';
import { RequestIdVariables, requestId } from 'hono/request-id';

import { CollaborationService } from '../service/CollaborationService';
import { InMemoryCollaborationRepository } from '../infra/InMemoryCollaborationRepository';
import { InMemoryTodoRepository } from '../infra/InMemoryTodoRepository';
import { InMemoryUserRepository } from '../infra/InMemoryUserRepository';
import { RabbitMQReminder } from './RabbitMQReminder';
import { RabbitMQService } from './RabbitMQService';
import { ReminderConsumer } from './ReminderConsumer';
import { SimpleScheduler } from '../infra/SimpleScheduler';
import { TodoService } from '../service/TodoService';
import { UserService } from '../service/UserService';
import { WebResponse } from '../domain/WebResponse';
import { errorMiddleware } from './ErrorHandler';

// inject app new Hono() in this bootstrap function

type ApplicationVariables = {
	requestId: RequestIdVariables['requestId'];
};

async function bootstrap() {
	// Wire up dependencies
	const userRepo = new InMemoryUserRepository();
	const todoRepo = new InMemoryTodoRepository();
	const collabRepo = new InMemoryCollaborationRepository();
	const scheduler = new SimpleScheduler();
	const todoService = new TodoService(todoRepo, userRepo);
	const userService = new UserService(userRepo);
	const collabService = new CollaborationService(
		collabRepo,
		todoRepo,
		userRepo
	);

	await RabbitMQService.initializeRabbitMQ();
	const producerChannel = await RabbitMQService.getProducerChannel();
	await RabbitMQReminder(producerChannel);
	await ReminderConsumer(todoService);

	console.log('Todo Reminder Service - Bootstrap Complete');
	console.log('Repositories and services initialized.');
	console.log('Note: HTTP server implementation left for candidate to add.');

	const app = new Hono<{ Variables: ApplicationVariables }>();
	app.use(requestId());

	// Candidate should implement HTTP server here
	// Example: scheduler.scheduleRecurring('reminder-check', 60000, () => todoService.processReminders());

	// scheduler.scheduleRecurring(
	// 	'reminder-check',
	// 	60000,
	// 	async () => await todoService.processReminders()
	// );

	// TODO: Implement HTTP server with the following routes:
	// POST /users - Create a new user
	// GET /users/:id - Get user by ID
	// POST /todos - Create a new todo
	// GET /todos/:id - Get todo by ID
	// PUT /todos/:id - Update a todo
	// DELETE /todos/:id - Delete a todo
	// GET /users/:userId/todos - Get all todos for a user
	// POST /todos/:id/share - Share a todo with another user

	app.post('/users', async (c: Context) => {
		const request: CreateUserDTO = await c.req.json();
		const response: User = await userService.create(request);

		c.status(201);
		return c.json<WebResponse<User>>({
			code: 201,
			message: 'User created successfully',
			data: response,
		});
	});

	app.get('/users/:userId/todos', async (c: Context) => {
		const userId: string = c.req.param('userId');

		const response = await todoService.getTodosByUser(userId);

		return c.json<WebResponse<Todo[]>>({
			code: 200,
			message: 'success get all todos',
			data: response,
		});
	});

	app.get('/users/:id', async (c: Context) => {
		const userId: string = c.req.param('id');

		const response: User = await userService.findById(userId);

		c.status(200);
		return c.json<WebResponse<User>>({
			code: 200,
			message: 'User retrieved successfully',
			data: response,
		});
	});

	app.post('/todos', async (c: Context) => {
		const request: CreateTodoDTO = await c.req.json();
		const response: Todo = await todoService.createTodo(request);

		c.status(201);
		return c.json<WebResponse<Todo>>({
			code: 201,
			message: 'Success create todo',
			data: response,
		});
	});

	app.get('/todos', async (c: Context) => {
		const userIdQueryParam = c.req.query('userId');

		const response = await todoService.getTodosByUser(`${userIdQueryParam}`);

		return c.json<WebResponse<Todo[]>>({
			code: 200,
			message: 'success get all todos',
			data: response,
		});
	});

	app.get('/todos/:id', async (c: Context) => {
		const todoId: string = c.req.param('id');
		const response: Todo = await todoService.getTodoById(todoId);

		c.status(200);
		return c.json<WebResponse<Todo>>({
			code: 200,
			message: 'success find one todo',
			data: response,
		});
	});

	app.put('/todos/:id', async (c: Context) => {
		const request: UpdateTodoDTO = await c.req.json();
		request.id = c.req.param('id');

		const response = await todoService.update(request);

		c.status(200);
		return c.json<WebResponse<Todo>>({
			code: 200,
			message: 'success update todo',
			data: response,
		});
	});

	app.delete('/todos/:id', async (c: Context) => {
		const todoId: string = c.req.param('id');
		const response: boolean = await todoService.remove(todoId);

		c.status(204);
		return c.json<WebResponse<boolean>>({
			code: 204,
			message: 'success remove todo',
			data: response,
		});
	});

	app.patch('todos/:id/complete', async (c: Context) => {
		const todoId: string = c.req.param('id');

		const response: Todo = await todoService.completeTodo(todoId);

		return c.json<WebResponse<Todo>>({
			code: 200,
			message: 'success complete todo',
			data: response,
		});
	});

	app.post('/todos/:id/share', async (c: Context) => {
		const request: CreateCollaborationDTO = await c.req.json();
		request.todoId = c.req.param('id');

		const response: Collaboration = await collabService.shareTodo(request);

		return c.json<WebResponse<Collaboration>>({
			code: 200,
			message: 'success create collaboration',
			data: response,
		});
	});

	app.onError(errorMiddleware);

	Bun.serve({
		port: process.env.PORT ?? 3000,
		fetch: app.fetch,
	});
}

bootstrap().catch(console.error);
