import { AssetRepository } from '@/repositories/AssetRepository';

export interface IReportService {
	getReportByStatus(): Promise<{ count: number; status: string }[]>;
	getReportByType(): Promise<{ count: number; type: string }[]>;
	getReportByYear(year: number): Promise<unknown>;
}

export class ReportService implements IReportService {
	private readonly assetRepository: AssetRepository;

	constructor(assetRepository: AssetRepository) {
		this.assetRepository = assetRepository;
	}

	public async getReportByStatus() {
		const result = await this.assetRepository.getReportByStatus();
		return result.map((item) => ({ count: item.count, status: item._id }));
	}

	public async getReportByType() {
		const result = await this.assetRepository.getReportByType();
		return result.map((item) => ({ count: item.count, type: item._id }));
	}

	public async getReportByYear(year: number) {
		const currentYearData = await this.assetRepository.getReportByYear(year);
		const previousYearData = await this.assetRepository.getReportByYear(year - 1);

		const calculateStats = (current: { _id: string; count: number }[], previous: { _id: string; count: number }[], keyName: 'status' | 'type') => {
			return current.map((curr) => {
				const prev = previous.find((p) => p._id === curr._id);
				const previousCount = prev ? prev.count : 0;
				const difference = curr.count - previousCount;
				const percentage = previousCount === 0 ? (curr.count > 0 ? 100 : 0) : Math.round((difference / previousCount) * 100);
				return {
					count: curr.count,
					difference,
					[keyName]: curr._id,
					percentage,
					previousCount,
				};
			});
		};

		return {
			byStatus: calculateStats(currentYearData.byStatus, previousYearData.byStatus, 'status'),
			byType: calculateStats(currentYearData.byType, previousYearData.byType, 'type'),
		};
	}
}
