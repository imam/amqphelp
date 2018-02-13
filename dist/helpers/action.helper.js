"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class MessagingAction {

  // Depedency Injection:
  constructor({ settings, utils, MessagingChannel, successful_rpc } = {}) {
    // a service for handling AMQP channel creation
    this.MessagingChannel = MessagingChannel;

    // configuration settings
    this.settings = settings;

    // messaging utilities function helper
    this.utils = utils || null;

    // other tracked parameters
    this.ping_count = 0;
    this.retry_rpc = 0;
    this.successful_rpc = successful_rpc || false;
    this.stringify_payload;
  }

  async ping(ping_message, ping_interval = 3000) {
    let self = this;

    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    let queue_name = `${process.env.npm_package_name}_heartbeat`;

    await channel.assertQueue(queue_name);

    let interval = setInterval(async function () {
      let the_queue = channel.sendToQueue(queue_name, new Buffer(`${ping_message} ${self.ping_count}`));

      if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${ping_message} ${self.ping_count}'`);

      self.ping_count++;
    }, ping_interval);

    return interval;
  }

  async send(queue_name, queue_message) {

    if (queue_name === undefined || queue_message === undefined) {
      throw new Error('Queue name and queue message is undefined');
    }

    let self = this;

    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name);

    let output = JSON.stringify(queue_message);

    let the_queue = channel.sendToQueue(queue_name, new Buffer(output));

    if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${output}'`);

    return true;
  }

  async create_task(queue_name = null, payload = null, durable = true, persistent = true) {

    if (queue_name === null || payload === null) {
      throw new Error('Queue name and payload is required, as first and second params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name, { durable: durable });

    this.stringify_payload = JSON.stringify(payload);

    let the_queue = channel.sendToQueue(queue_name, new Buffer(this.stringify_payload), { persistent: persistent });
  }

  async queue_worker(queue_name = null, prefetch = 3, durable = true) {

    if (queue_name === null) {
      throw new Error('Queue name is required, as the first params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name, { durable: durable });

    channel.prefetch(prefetch);

    channel.consume(queue_name, function (msg) {
      if (msg !== null) {
        // events[queue_name](msg.content);
        ch.ack(msg);
      }
    }, { noAck: false });
  }

  async rpc_client(queue_name = null, payload = null, correlationId = null, response_activity = null) {

    if (queue_name === null || payload === null) {
      throw new Error('Queue name and payload is required, as first and second params');
    }

    if (correlationId === null || response_activity === null) {
      throw new Error('correlationId and response_activity is required, as third and fourth params');
    }

    let self = this;

    let channel = await self.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    let q = await channel.assertQueue('', { exclusive: true });

    channel.consume(q.queue, async function (msg) {
      if (msg.properties.correlationId === correlationId) {
        await response_activity(msg, channel);
        self.successful_rpc = true;
      }
    }, { noAck: true });

    self.stringify_payload = JSON.stringify(payload);

    let the_queue = channel.sendToQueue(queue_name, new Buffer(self.stringify_payload), { correlationId: correlationId, replyTo: q.queue });
  }

  async rpc_server(queue_name = null, activity = null, prefetch = 3) {
    if (queue_name === null || activity === null) {
      throw new Error('Queue name and activity is required, as the first and second params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name, { durable: false });

    channel.prefetch(prefetch);

    channel.consume(queue_name, async function reply(msg) {
      await activity(msg, channel);
    });
  }

  async receive(queue_name, callback) {
    if (!queue_name || !callback) {
      throw new TypeError();
    }
    let self = this;

    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name);
    channel.consume(queue_name, function (msg) {
      if (msg !== null) {
        channel.ack(msg);
        callback(JSON.parse(msg.content.toString()));
      }
    });
  }

  //DEPRECATED: renamed to receive
  async subscribe(queue_name, callback) {
    let self = this;

    let channel = await this.MessagingChannel.create(this.settings.connection.host, this.settings.connection.options.user, this.settings.connection.options.pass);

    await channel.assertQueue(queue_name);
    channel.consume(queue_name, function (msg) {
      if (msg !== null) {
        console.info(msg.content.toString());
        // events[queue_name](msg.content);
        channel.ack(msg);
        callback(msg);
      }
    });
  }

}exports.MessagingAction = MessagingAction;
;
//# sourceMappingURL=action.helper.js.map