import { Collaboration } from '../domain/Collaboration';
import { ICollaborationRepository } from '../core/ICollaborationRepository';
import { randomUUIDv7 } from 'bun';

export class InMemoryCollaborationRepository
	implements ICollaborationRepository
{
	private collaborations: Collaboration[] = [];

	async create(userId: string, todoId: string): Promise<Collaboration> {
		const collaboration: Collaboration = {
			id: randomUUIDv7(),
			todoId: todoId,
			userId: userId,
		};

		this.collaborations.push(collaboration);
		return collaboration;
	}

	async remove(collaborationId: string): Promise<Collaboration | null> {
		const indexCollab = this.collaborations.findIndex(
			(collab) => collab.id === collaborationId
		);

		if (indexCollab === -1) {
			return null;
		}

		const [removed] = this.collaborations.splice(indexCollab, 1);
		return removed;
	}

	async findByUserAndTodo(
		userId: string,
		todoId: string
	): Promise<Collaboration | null> {
		return (
			this.collaborations.find(
				(c) => c.userId === userId && c.todoId === todoId
			) || null
		);
	}
}
