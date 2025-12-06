import amqp, { Channel, ChannelModel, Connection } from 'amqplib';

export class RabbitMQService {
	private static connection: ChannelModel;
	private static producerChannel: Channel;
	private static consumerChannel: Channel;

	static async initializeRabbitMQ(): Promise<void> {
		if (!this.connection) {
			this.connection = await amqp.connect('amqp://localhost');
			console.log('[RabbitMQ] connected');

			this.producerChannel = await this.connection.createChannel();
			this.consumerChannel = await this.connection.createChannel();
		}
	}

	static async getProducerChannel(): Promise<Channel> {
		return this.producerChannel;
	}

	static async getConsumerChannel(): Promise<Channel> {
		return this.consumerChannel;
	}
}
