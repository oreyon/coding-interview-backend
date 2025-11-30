import { ZodType } from 'zod';

export class ValidationService {
	static validate<T>(schema: ZodType<T>, data: T): T {
		return schema.parse(data);
	}
}
