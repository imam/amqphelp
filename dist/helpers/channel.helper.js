"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
class MessagingChannel {

  // Depedency Injection:
  constructor({ ampql, utils } = {}) {
    // AMQP (Advanced Message Queuing Protocol) client with promise response
    this.ampql = ampql || require('amqplib');

    // messaging utilities function helper
    this.utils = utils;

    // other tracked parameters
    this.retry_time = 0;
    this.channel;
    this.connection;
  }

  async create(hostname = null, broker_user = null, broker_pass = null, retry_connection_time, retry_limit) {
    if (process.env.NODE_ENV === "test") {
      retry_limit = retry_limit || 0;
    } else {
      retry_limit = retry_limit || 3;
    }

    if (this.retry_time > 0) {
      if (process.env.NODE_ENV !== "test") console.info(`Retry ${this.retry_time} connecting to broker`);
    }

    if (hostname === null) {
      throw new Error("broker host is required!");
    }

    if (broker_user === null || broker_pass === null) {
      throw new Error("broker user and password is required!");
    }

    const amqp_path = `amqp://${broker_user}:${broker_pass}@${hostname}`;

    console.info(amqp_path);

    let retry_connection = false;

    try {
      this.connection = await this.ampql.connect(amqp_path);
    } catch (e) {
      if (e.isOperational) {
        retry_connection = true;
      } else {
        throw e;
      }
    }

    if (this.connection) {
      try {
        this.channel = await this.connection.createChannel();
        return this.channel;
      } catch (e) {
        throw e;
      }
    } else {
      // do retry
      if (retry_connection && this.retry_time < retry_limit) {
        this.retry_time++;

        await this.utils.sleep(retry_connection_time, 'Retry broker connection');
        this.channel = await this.create(hostname, broker_user, broker_pass, retry_connection_time, retry_limit);
        return this.channel;
      } else {
        if (this.retry_time > 0) {
          throw new Error(`failed to create channel after retry ${this.retry_time} times`);
        } else {
          throw new Error('failed to create channel');
        }
      }
    }
  }

}exports.MessagingChannel = MessagingChannel;
;
//# sourceMappingURL=channel.helper.js.map