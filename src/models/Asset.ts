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
