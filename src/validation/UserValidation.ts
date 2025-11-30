import z, { ZodType } from 'zod';

import { CreateUserDTO } from '../domain/User';

export class UserValidation {
	static readonly CREATE: ZodType<CreateUserDTO> = z.object({
		email: z.email().nonempty(),
		name: z.string().min(1).max(100),
	});
}
