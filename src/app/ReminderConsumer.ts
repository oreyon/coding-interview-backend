import amqp, { Channel } from 'amqplib';

import { RabbitMQService } from './RabbitMQService';
import { TodoService } from '../service/TodoService';

export async function ReminderConsumer(todoService: TodoService) {
	const channel: Channel = await RabbitMQService.getConsumerChannel();

	await channel.consume('reminder.queue', async (msg) => {
		if (!msg) {
			return;
		}

		try {
			const { todoId } = JSON.parse(msg.content.toString());
			await todoService.markReminderDue(todoId);
			channel.ack(msg);
			console.log(`[Consumer] Processed reminder for todo ${todoId}`);
		} catch (error) {
			console.error('[Consumer] Error processing reminder:', error);
			channel.nack(msg, false, false);
		}
	});

	console.log('[Consumer] Reminder consumer started');
}
