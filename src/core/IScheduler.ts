export interface IScheduler {
	scheduleRecurring(
		name: string,
		intervalMs: number,
		fn: () => number | Promise<number>
	): void;
	stop(name: string): void;
}
