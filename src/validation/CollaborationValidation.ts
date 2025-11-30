import z, { ZodType } from 'zod';

import { CreateCollaborationDTO } from '../domain/Collaboration';

export class CollaborationValidation {
	static readonly CREATE: ZodType<CreateCollaborationDTO> = z.object({
		todoId: z.string().nonempty(),
		targetUserId: z.string().nonempty(),
	});
}
