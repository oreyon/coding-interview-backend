import { Channel } from 'amqplib';
import { RabbitMQService } from './RabbitMQService';

export const ReminderProducer = {
	async send(todoId: string, delayMs: number): Promise<void> {
		const channel: Channel = await RabbitMQService.getProducerChannel();

		const message: string = JSON.stringify({ todoId });

		channel.publish('', 'reminder.delay.queue', Buffer.from(message), {
			expiration: Math.max(delayMs, 0).toString(),
		});

		console.log(`[Producer] Scheduled reminder for todo ${todoId}`);
	},
};
