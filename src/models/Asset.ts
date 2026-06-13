import type { Document } from 'mongoose';

import mongoose, { Schema } from 'mongoose';

export interface IAsset extends Document {
	[key: string]: unknown; // allow any other fields
	id: string; // The UUID
	installed_at: Date;
	lat: number;
	lng: number;
	name: string;
	status: string;
	tenant_id: string;
	type: string;
}

const AssetSchema = new Schema(
	{
		id: { required: true, type: String, unique: true },
		installed_at: { required: true, type: Date },
		lat: { required: true, type: Number },
		lng: { required: true, type: Number },
		name: { required: true, type: String },
		status: { required: true, type: String },
		tenant_id: { required: true, type: String },
		type: { required: true, type: String },
	},
	{
		strict: false,
		timestamps: true,
	},
);

AssetSchema.index({ tenant_id: 1 });

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);

import { z } from 'zod';

export const AssetZodSchema = z
	.object({
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		id: z.string().uuid(),
		installed_at: z.coerce.date(),
		lat: z.number(),
		lng: z.number(),
		name: z.string().min(1),
		status: z.string().min(1),
		// eslint-disable-next-line @typescript-eslint/no-deprecated
		tenant_id: z.string().uuid(),
		type: z.string().min(1),
	})
	.catchall(z.unknown());

export const CreateAssetSchema = AssetZodSchema;
export const UpdateAssetSchema = AssetZodSchema.partial().omit({ id: true, tenant_id: true });

export type AssetDto = z.infer<typeof AssetZodSchema>;
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;
export type UpdateAssetDto = z.infer<typeof UpdateAssetSchema>;
