import { IScheduler } from '../core/IScheduler';

export class SimpleScheduler implements IScheduler {
	private intervals = new Map<string, NodeJS.Timeout>();

	scheduleRecurring(
		name: string,
		intervalMs: number,
		fn: () => number | Promise<number>
	): void {
		const interval = setInterval(async () => {
			try {
				console.log('Running reminder process at', new Date());
				await fn();
			} catch (error) {
				console.error(`[Scheduler:${name}] Error in task:`, error);
			}
		}, intervalMs);

		this.intervals.set(name, interval);
	}

	stop(name: string): void {
		const interval = this.intervals.get(name);
		if (interval) {
			clearInterval(interval);
			this.intervals.delete(name);
		}
	}
}
