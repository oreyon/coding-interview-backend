import { Collaboration, CreateCollaborationDTO } from '../domain/Collaboration';

import { CollaborationValidation } from '../validation/CollaborationValidation';
import { HTTPException } from 'hono/http-exception';
import { ICollaborationRepository } from '../core/ICollaborationRepository';
import { ITodoRepository } from '../core/ITodoRepository';
import { IUserRepository } from '../core/IUserRepository';
import { Todo } from '../domain/Todo';
import { User } from '../domain/User';
import { ValidationService } from '../app/ValidationService';

export class CollaborationService {
	constructor(
		private collaborationRepo: ICollaborationRepository,
		private todoRepo: ITodoRepository,
		private userRepo: IUserRepository
	) {}

	async shareTodo(request: CreateCollaborationDTO): Promise<Collaboration> {
		const collabRequest: CreateCollaborationDTO = ValidationService.validate(
			CollaborationValidation.CREATE,
			request
		);

		const todo: Todo | null = await this.todoRepo.findById(
			collabRequest.todoId
		);

		if (!todo) {
			throw new HTTPException(404, {
				message: 'todo is not found',
			});
		}

		const user: User | null = await this.userRepo.findById(
			collabRequest.targetUserId
		);

		if (!user) {
			throw new HTTPException(404, {
				message: 'user is not found',
			});
		}

		const collabAlreadyExist: Collaboration | null =
			await this.collaborationRepo.findByUserAndTodo(
				collabRequest.targetUserId,
				collabRequest.todoId
			);

		if (collabAlreadyExist) {
			return collabAlreadyExist;
		}

		const createCollab = await this.collaborationRepo.create(
			collabRequest.targetUserId,
			collabRequest.todoId
		);

		return createCollab;
	}
}
