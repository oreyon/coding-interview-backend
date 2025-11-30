import { Collaboration } from '../domain/Collaboration';

export interface ICollaborationRepository {
	create(userId: string, todoId: string): Promise<Collaboration>;
	remove(collaborationId: string): Promise<Collaboration | null>;
	findByUserAndTodo(
		userId: string,
		todoId: string
	): Promise<Collaboration | null>;
}
