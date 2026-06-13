import { AssetRepository } from '@/repositories/AssetRepository';

export interface IReportService {
	getAssetsNear(lat: number, lng: number, radius: number, unit: string): Promise<unknown>;
	getReportByStatus(): Promise<{ count: number; status: string }[]>;
	getReportByType(): Promise<{ count: number; type: string }[]>;
	getReportByYear(year: number): Promise<unknown>;
}

export class ReportService implements IReportService {
	private readonly assetRepository: AssetRepository;

	constructor(assetRepository: AssetRepository) {
		this.assetRepository = assetRepository;
	}

	public async getAssetsNear(lat: number, lng: number, radius: number, unit: string) {
		let maxDistanceKm = radius;
		if (unit === 'm') {
			maxDistanceKm = radius / 1000;
		} else if (unit === 'miles') {
			maxDistanceKm = radius * 1.60934;
		}

		const latDelta = maxDistanceKm / 111.32;
		const lngDelta = maxDistanceKm / (111.32 * Math.cos(lat * (Math.PI / 180)));

		const minLat = lat - latDelta;
		const maxLat = lat + latDelta;
		const minLng = lng - lngDelta;
		const maxLng = lng + lngDelta;

		const assets = await this.assetRepository.getAssetsInBoundingBox(minLat, maxLat, minLng, maxLng);

		const toRad = (value: number) => (value * Math.PI) / 180;
		const R = 6371; // Earth's radius in km

		const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
			const dLat = toRad(lat2 - lat1);
			const dLon = toRad(lon2 - lon1);
			const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			return R * c;
		};

		const assetsWithDistance = assets.map((asset) => {
			const distanceKm = calculateDistance(lat, lng, asset.lat, asset.lng);
			let distance = distanceKm;
			if (unit === 'm') {
				distance = distanceKm * 1000;
			} else if (unit === 'miles') {
				distance = distanceKm / 1.60934;
			}
			return { distance, id: asset.id, name: asset.name };
		});

		return assetsWithDistance.filter((item) => item.distance <= radius).sort((a, b) => a.distance - b.distance);
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
