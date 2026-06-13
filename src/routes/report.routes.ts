import { Router } from 'express';

import type { IReportController } from '@/controllers/ReportController';

export default function createReportRouter(reportController: IReportController) {
	const reportRouter = Router();

	reportRouter.get('/by-status', reportController.getReportByStatus.bind(reportController));
	reportRouter.get('/by-type', reportController.getReportByType.bind(reportController));
	reportRouter.get('/year/:year', reportController.getReportByYear.bind(reportController));

	return reportRouter;
}
