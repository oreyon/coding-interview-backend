export interface Collaboration {
	id: string;
	todoId: string;
	userId: string;
}

export interface CreateCollaborationDTO {
	todoId: string;
	targetUserId: string;
}
