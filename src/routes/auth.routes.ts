import express, { Router } from 'express';

import { IAuthController } from '@/controllers/AuthController';

export default function createAuthRouter(authController: IAuthController): Router {
	const router = express.Router();

	router.post('/login', authController.login);
	router.post('/logout', authController.logout);
	router.post('/refresh', authController.refresh);

	return router;
}
