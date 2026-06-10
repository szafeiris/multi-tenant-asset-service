import { z } from 'zod';

export const UserSchema = z.object({
	createdAt: z.date().optional(),
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	email: z.string().email(),
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	id: z.string().uuid().optional(),
	name: z.string().min(1),
	role: z.string().min(1),
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	tenantId: z.string().uuid(),
});

export const CreateUserSchema = UserSchema.pick({
	email: true,
	name: true,
	role: true,
	tenantId: true,
});

export const UpdateUserSchema = CreateUserSchema.partial();

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
export type UserDto = z.infer<typeof UserSchema>;
