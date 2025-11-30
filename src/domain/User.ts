export interface User {
	id: string;
	email: string;
	name: string;
	createdAt: Date;
}

export interface CreateUserDTO {
	email: string;
	name: string;
}
