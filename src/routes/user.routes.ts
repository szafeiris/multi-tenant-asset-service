import { Router } from 'express';

import type { IUserController } from '@/controllers/UserController';

export default function createUserRouter(userController: IUserController) {
	const userRouter = Router();

	userRouter.post('/', userController.createUser.bind(userController));
	userRouter.get('/', userController.getUsers.bind(userController));
	userRouter.get('/:id', userController.getUserById.bind(userController));
	userRouter.put('/:id', userController.updateUser.bind(userController));
	userRouter.delete('/:id', userController.deleteUser.bind(userController));

	return userRouter;
}
