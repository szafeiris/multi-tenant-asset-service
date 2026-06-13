/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

import { AssetRepository } from '@/repositories/AssetRepository';

import { ReportService } from './ReportService';

vi.mock('@/repositories/AssetRepository');

describe('ReportService', () => {
	let service: ReportService;
	let assetRepository: Mocked<AssetRepository>;

	beforeEach(() => {
		vi.clearAllMocks();

		assetRepository = new AssetRepository() as Mocked<AssetRepository>;
		service = new ReportService(assetRepository);
	});

	describe('getAssetsNear', () => {
		it('should correctly calculate distance in km', async () => {
			const mockAssets = [
				{ id: '1', lat: 0.1, lng: 0.1, name: 'Near Asset' }, // within ~15km
				{ id: '2', lat: 1.0, lng: 1.0, name: 'Far Asset' }, // > 100km
			];
			assetRepository.getAssetsInBoundingBox.mockResolvedValue(mockAssets);

			const result = await service.getAssetsNear(0, 0, 20, 'km');

			expect(assetRepository.getAssetsInBoundingBox).toHaveBeenCalled();
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('1');
			expect(result[0].distance).toBeLessThan(20);
		});

		it('should fail if repository throws', async () => {
			assetRepository.getAssetsInBoundingBox.mockRejectedValue(new Error('DB Error'));
			await expect(service.getAssetsNear(0, 0, 20, 'km')).rejects.toThrow('DB Error');
		});
	});

	describe('getReportByStatus', () => {
		it('should return counts mapped by status', async () => {
			const mockData = [
				{ _id: 'ACTIVE', count: 5 },
				{ _id: 'MAINTENANCE', count: 2 },
			];
			assetRepository.getReportByStatus.mockResolvedValue(mockData);

			const result = await service.getReportByStatus();

			expect(result).toEqual([
				{ count: 5, status: 'ACTIVE' },
				{ count: 2, status: 'MAINTENANCE' },
			]);
		});
	});

	describe('getReportByType', () => {
		it('should return counts mapped by type', async () => {
			const mockData = [{ _id: 'SENSOR', count: 10 }];
			assetRepository.getReportByType.mockResolvedValue(mockData);

			const result = await service.getReportByType();

			expect(result).toEqual([{ count: 10, type: 'SENSOR' }]);
		});
	});

	describe('getReportByYear', () => {
		it('should calculate year over year stats correctly', async () => {
			const currentYearData = {
				byStatus: [
					{ _id: 'ACTIVE', count: 10 },
					{ _id: 'BROKEN', count: 5 },
				],
				byType: [{ _id: 'SENSOR', count: 15 }],
			};
			const previousYearData = {
				byStatus: [
					{ _id: 'ACTIVE', count: 5 },
					{ _id: 'BROKEN', count: 0 },
				],
				byType: [{ _id: 'SENSOR', count: 10 }],
			};

			assetRepository.getReportByYear.mockResolvedValueOnce(currentYearData).mockResolvedValueOnce(previousYearData);

			const result = (await service.getReportByYear(2023)) as any;

			expect(assetRepository.getReportByYear).toHaveBeenNthCalledWith(1, 2023);
			expect(assetRepository.getReportByYear).toHaveBeenNthCalledWith(2, 2022);

			const activeStatus = result.byStatus.find((s: any) => s.status === 'ACTIVE');
			expect(activeStatus).toEqual({
				count: 10,
				difference: 5,
				percentage: 100, // (5/5) * 100
				previousCount: 5,
				status: 'ACTIVE',
			});

			const brokenStatus = result.byStatus.find((s: any) => s.status === 'BROKEN');
			expect(brokenStatus).toEqual({
				count: 5,
				difference: 5,
				percentage: 100, // prev 0 -> curr > 0 is 100%
				previousCount: 0,
				status: 'BROKEN',
			});
		});

		it('should handle repository errors gracefully', async () => {
			assetRepository.getReportByYear.mockRejectedValue(new Error('Year data fetch failed'));
			await expect(service.getReportByYear(2023)).rejects.toThrow('Year data fetch failed');
		});
	});
});
