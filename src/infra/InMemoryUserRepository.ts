import { IUserRepository } from '../core/IUserRepository';
import { User } from '../domain/User';

export class InMemoryUserRepository implements IUserRepository {
	private users: User[] = [];
	private idCounter = 0;

	async create(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
		this.idCounter++;
		const user: User = {
			...userData,
			id: `user-${this.idCounter}`,
			createdAt: new Date(),
		};
		this.users.push(user);
		return user;
	}

	async findById(id: string): Promise<User | null> {
		const user = this.users.find((u: User): boolean => u.id === id);
		return user || null;
	}

	async findAll(): Promise<User[]> {
		return this.users;
	}

	async findByEmail(email: string): Promise<User | null> {
		const user = this.users.find((user: User): boolean => user.email === email);

		return user || null;
	}
}
