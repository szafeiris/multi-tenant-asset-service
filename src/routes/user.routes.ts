import { Router } from 'express';

import type { IUserController } from '@/controllers/UserController';

import { hasRole } from '@/middleware/rbac';

export default function createUserRouter(userController: IUserController) {
	const userRouter = Router();

	userRouter.post('/', hasRole(['admin', 'editor']), userController.createUser.bind(userController));
	userRouter.get('/', hasRole(['admin', 'editor', 'viewer']), userController.getUsers.bind(userController));
	userRouter.get('/:id', hasRole(['admin', 'editor', 'viewer']), userController.getUserById.bind(userController));
	userRouter.put('/:id', hasRole(['admin', 'editor']), userController.updateUser.bind(userController));
	userRouter.delete('/:id', hasRole(['admin', 'editor']), userController.deleteUser.bind(userController));

	return userRouter;
}
