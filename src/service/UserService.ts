import { CreateUserDTO, User } from '../domain/User';

import { HTTPException } from 'hono/http-exception';
import { IUserRepository } from '../core/IUserRepository';
import { UserValidation } from '../validation/UserValidation';
import { ValidationService } from '../app/ValidationService';

export class UserService {
	constructor(private userRepository: IUserRepository) {}

	async create(request: CreateUserDTO): Promise<User> {
		// validate request data
		const createRequest: CreateUserDTO =
			ValidationService.validate<CreateUserDTO>(UserValidation.CREATE, request);

		const emailAlreadyExists: User | null =
			await this.userRepository.findByEmail(createRequest.email);

		if (emailAlreadyExists) {
			throw new HTTPException(400, { message: 'email already in use' });
		}

		// create user
		const userCreate: User = await this.userRepository.create({
			email: createRequest.email,
			name: createRequest.name,
		});

		return userCreate;
	}

	async findById(userId: string): Promise<User> {
		const user: User | null = await this.userRepository.findById(userId);

		if (!user) {
			throw new HTTPException(404, { message: 'user is not found' });
		}

		return user;
	}
}
