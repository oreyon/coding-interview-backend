import { CreateTodoDTO, UpdateTodoDTO } from '../domain/Todo';
import z, { ZodType } from 'zod';

export class TodoValidation {
	static readonly CREATE: ZodType<CreateTodoDTO> = z.object({
		userId: z.string().nonempty(),
		title: z.string().trim().min(1).max(200),
		description: z.string().optional(),
		// string ISO 8601 date format
		remindAt: z.iso.datetime().optional().nullable(),
	});

	static readonly UPDATE: ZodType<UpdateTodoDTO> = z.object({
		id: z.string().nonempty(),
		userId: z.string().nonempty(),
		title: z.string().trim().min(1).max(200).optional(),
		status: z.enum(['PENDING', 'DONE', 'REMINDER_DUE']),
		description: z.string().optional(),
		remindAt: z.iso.datetime().optional().nullable(),
	});
}
