import { z } from 'zod';

export const LoginSchema = z.object({
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	email: z.string().email(),
	password: z.string().min(1),
	tenant_slug: z.string().min(1),
});

export interface AuthResponseDto extends AuthTokensDto {
	user: {
		email: string;
		id: string;
		name: string;
		role: string;
		tenantId: string;
	};
}

export interface AuthTokensDto {
	accessToken: string;
	refreshToken: string;
}

export type LoginDto = z.infer<typeof LoginSchema>;
