import { z } from 'zod';

export const TenantSchema = z.object({
	createdAt: z.date().optional(),
	// eslint-disable-next-line @typescript-eslint/no-deprecated
	id: z.string().uuid().optional(),
	name: z.string().min(1),
	slug: z.string().min(1),
});

export const CreateTenantSchema = TenantSchema.pick({
	name: true,
	slug: true,
}).extend({
	adminUser: z.object({
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		email: z.string().email(),
		name: z.string().min(1),
		password: z.string().min(1),
	}),
});

export const UpdateTenantSchema = CreateTenantSchema.partial();

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;
export type TenantDto = z.infer<typeof TenantSchema>;
export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>;
