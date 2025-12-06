import { Channel } from 'amqplib';

export async function RabbitMQReminder(channel: Channel) {
	// DLX exchange (destination after TTL expires)
	await channel.assertExchange('reminder.exchange', 'direct', {
		durable: true,
	});

	// Delay queue with TTL → DLX forwarding
	await channel.assertQueue('reminder.delay.queue', {
		durable: true,
		arguments: {
			'x-dead-letter-exchange': 'reminder.exchange',
			'x-dead-letter-routing-key': 'reminder.route',
		},
	});

	// Final queue where reminders go after TTL
	await channel.assertQueue('reminder.queue', {
		durable: true,
	});

	await channel.bindQueue(
		'reminder.queue',
		'reminder.exchange',
		'reminder.route'
	);

	console.log('[RabbitMQ] Reminder TTL + DLX queues/exchanges ready');
}
