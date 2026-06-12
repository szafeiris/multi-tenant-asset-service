import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { requestContextStorage } from '@/lib/context/requestContext';
import { LoginSchema } from '@/models/Auth';
import { IAuthService } from '@/services/AuthService';

export interface IAuthController {
	login: (req: Request, res: Response) => Promise<void>;
	logout: (req: Request, res: Response) => Promise<void>;
	refresh: (req: Request, res: Response) => Promise<void>;
}

export class AuthController implements IAuthController {
	constructor(private readonly authService: IAuthService) {}

	public login = async (req: Request, res: Response): Promise<void> => {
		const data = LoginSchema.parse(req.body);
		const result = await this.authService.login(data);
		
		const store = requestContextStorage.getStore();
		if (store) {
			store.userId = result.user.id;
			store.tenantId = result.user.tenantId;
			store.role = result.user.role;
		}
		
		res.status(200).json(result);
	};

	public logout = async (req: Request, res: Response): Promise<void> => {
		const authHeader = req.headers.authorization;
		const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
		const { refreshToken } = req.body as { refreshToken?: string };
		
		await this.authService.logout(accessToken, refreshToken ?? '');
		res.status(204).send();
	};

	public refresh = async (req: Request, res: Response): Promise<void> => {
		const authHeader = req.headers.authorization;
		const refreshToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : '';
		
		if (!refreshToken) {
			res.status(401).json({ error: 'Missing or invalid refresh token in Authorization header' });
			return;
		}
		
		const result = await this.authService.refresh(refreshToken);

		const store = requestContextStorage.getStore();
		const decoded = jwt.decode(result.accessToken) as null | { role?: string; tenantId?: string; userId?: string; };
		if (store && decoded) {
			store.userId = decoded.userId;
			store.tenantId = decoded.tenantId;
			store.role = decoded.role;
		}

		res.status(200).json(result);
	};
}
