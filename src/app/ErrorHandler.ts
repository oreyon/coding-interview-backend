import { $ZodIssue } from 'zod/v4/core';
import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HTTPResponseError } from 'hono/types';
import { ZodError } from 'zod';

export const errorMiddleware = async (
	error: Error | HTTPResponseError,
	c: Context
) => {
	if (error instanceof HTTPException) {
		c.status(error.status);
		return c.json({
			code: error.status,
			errors: error.message,
		});
	} else if (error instanceof ZodError) {
		c.status(400);
		return c.json({
			code: 400,
			errors: error.issues.map((issue: $ZodIssue) => {
				return {
					validation: issue.path.join('.'),
					message: issue.message,
				};
			}),
		});
	} else {
		c.status(500);
		return c.json({
			code: 500,
			errors: 'There is something wrong on the server.',
		});
	}
};
