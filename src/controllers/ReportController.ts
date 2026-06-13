import type { Request, Response } from 'express';

import type { IReportService } from '@/services/ReportService';

import { getLogger } from '@/lib/logging/logger';

const logger = getLogger();

export interface IReportController {
	getNearAssets(req: Request, res: Response): Promise<void>;
	getReportByStatus(req: Request, res: Response): Promise<void>;
	getReportByType(req: Request, res: Response): Promise<void>;
	getReportByYear(req: Request, res: Response): Promise<void>;
}

export class ReportController implements IReportController {
	private readonly reportService: IReportService;

	constructor(reportService: IReportService) {
		this.reportService = reportService;
	}

	public async getNearAssets(req: Request, res: Response): Promise<void> {
		try {
			const lat = parseFloat(req.query.lat as string);
			const lng = parseFloat(req.query.lng as string);
			const radius = parseFloat((req.query.radius as string) || '10');
			const unit = (req.query.unit as string) || 'km';

			if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
				res.status(400).json({ error: 'Invalid parameters: lat, lng, and radius must be numbers.' });
				return;
			}

			if (unit !== 'm' && unit !== 'km' && unit !== 'miles') {
				res.status(400).json({ error: 'Invalid unit parameter: must be m, km, or miles.' });
				return;
			}

			const data = await this.reportService.getAssetsNear(lat, lng, radius, unit);
			res.status(200).json(data);
		} catch (error) {
			logger.error('Failed to get near assets', { error });
			res.status(500).json({ error: 'Failed to get near assets' });
		}
	}

	public async getReportByStatus(req: Request, res: Response): Promise<void> {
		try {
			const report = await this.reportService.getReportByStatus();
			res.status(200).json(report);
		} catch (error) {
			logger.error('Failed to generate report by status', { error });
			res.status(500).json({ error: 'Failed to generate report by status' });
		}
	}

	public async getReportByType(req: Request, res: Response): Promise<void> {
		try {
			const report = await this.reportService.getReportByType();
			res.status(200).json(report);
		} catch (error) {
			logger.error('Failed to generate report by type', { error });
			res.status(500).json({ error: 'Failed to generate report by type' });
		}
	}

	public async getReportByYear(req: Request, res: Response): Promise<void> {
		try {
			const year = parseInt(req.params.year as string, 10);
			if (isNaN(year)) {
				res.status(400).json({ error: 'Invalid year parameter' });
				return;
			}
			const report = await this.reportService.getReportByYear(year);
			res.status(200).json(report);
		} catch (error) {
			logger.error('Failed to generate report by year', { error });
			res.status(500).json({ error: 'Failed to generate report by year' });
		}
	}
}
