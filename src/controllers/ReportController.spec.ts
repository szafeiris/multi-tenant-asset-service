/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment */
import { Request, Response } from 'express';
import { beforeEach, describe, expect, it, Mock, Mocked, vi } from 'vitest';

import { IReportService } from '@/services/ReportService';

import { ReportController } from './ReportController';

describe('ReportController', () => {
	let controller: ReportController;
	let reportService: Mocked<IReportService>;
	let req: Partial<Request>;
	let res: Partial<Response>;
	let json: Mock;
	let send: Mock;
	let status: Mock;

	beforeEach(() => {
		vi.clearAllMocks();

		reportService = {
			getAssetsNear: vi.fn(),
			getReportByStatus: vi.fn(),
			getReportByType: vi.fn(),
			getReportByYear: vi.fn(),
		};

		controller = new ReportController(reportService);

		json = vi.fn();
		send = vi.fn();
		status = vi.fn().mockReturnValue({ json, send });

		req = {
			body: {},
			params: {},
			query: {},
		};
		res = {
			status,
		} as any;
	});

	describe('getAssetsNear', () => {
		it('should return 200 with nearby assets', async () => {
			req.query = { lat: '10', lng: '20', radius: '5', unit: 'km' };
			reportService.getAssetsNear.mockResolvedValue([{ id: 'asset-1' }]);

			await controller.getNearAssets(req as Request, res as Response);

			expect(reportService.getAssetsNear).toHaveBeenCalledWith(10, 20, 5, 'km');
			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith([{ id: 'asset-1' }]);
		});

		it('should return 400 on validation failure', async () => {
			req.query = { lat: '10' }; // Missing required fields

			await controller.getNearAssets(req as Request, res as Response);

			expect(reportService.getAssetsNear).not.toHaveBeenCalled();
			expect(status).toHaveBeenCalledWith(400);
		});

		it('should use default unit if not provided', async () => {
			req.query = { lat: '10', lng: '20', radius: '5' };
			reportService.getAssetsNear.mockResolvedValue([]);

			await controller.getNearAssets(req as Request, res as Response);

			expect(reportService.getAssetsNear).toHaveBeenCalledWith(10, 20, 5, 'km'); // default is km
			expect(status).toHaveBeenCalledWith(200);
		});
	});

	describe('getReportByStatus', () => {
		it('should return status report with 200', async () => {
			reportService.getReportByStatus.mockResolvedValue([{ count: 5, status: 'ACTIVE' }]);

			await controller.getReportByStatus(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
			expect(json).toHaveBeenCalledWith([{ count: 5, status: 'ACTIVE' }]);
		});

		it('should return 500 if service throws', async () => {
			reportService.getReportByStatus.mockRejectedValue(new Error('Internal error'));

			await controller.getReportByStatus(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(500);
			expect(json).toHaveBeenCalledWith({ error: 'Failed to generate report by status' });
		});
	});

	describe('getReportByType', () => {
		it('should return type report with 200', async () => {
			reportService.getReportByType.mockResolvedValue([{ count: 10, type: 'SENSOR' }]);

			await controller.getReportByType(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(200);
		});
	});

	describe('getReportByYear', () => {
		it('should return yearly report with 200', async () => {
			req.params = { year: '2023' };
			reportService.getReportByYear.mockResolvedValue({ byStatus: [], byType: [] });

			await controller.getReportByYear(req as Request, res as Response);

			expect(reportService.getReportByYear).toHaveBeenCalledWith(2023);
			expect(status).toHaveBeenCalledWith(200);
		});

		it('should return 400 on validation failure', async () => {
			req.params = { year: 'not-a-number' };

			await controller.getReportByYear(req as Request, res as Response);

			expect(status).toHaveBeenCalledWith(400);
		});
	});
});
