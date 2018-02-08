"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  ping(ping_message, ping_interval = 3000) {
    var _this = this;

    return _asyncToGenerator(function* () {
      let self = _this;

      let channel = yield _this.MessagingChannel.create(_this.settings.connection.host, _this.settings.connection.options.user, _this.settings.connection.options.pass);

      let queue_name = `${process.env.npm_package_name}_heartbeat`;

      yield channel.assertQueue(queue_name);

      let interval = setInterval(_asyncToGenerator(function* () {
        let the_queue = channel.sendToQueue(queue_name, new Buffer(`${ping_message} ${self.ping_count}`));

        if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${ping_message} ${self.ping_count}'`);

        self.ping_count++;
      }), ping_interval);

      return interval;
    })();
  }

  send(queue_name, queue_message) {
    var _this2 = this;

    return _asyncToGenerator(function* () {

      if (queue_name === undefined || queue_message === undefined) {
        throw new Error('Queue name and queue message is undefined');
      }

      let self = _this2;

      let channel = yield _this2.MessagingChannel.create(_this2.settings.connection.host, _this2.settings.connection.options.user, _this2.settings.connection.options.pass);

      yield channel.assertQueue(queue_name);

      let the_queue = channel.sendToQueue(queue_name, new Buffer(`${queue_message}`));

      if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${queue_message}'`);

      return true;
    })();
  }

  create_task(queue_name = null, payload = null, durable = true, persistent = true) {
    var _this3 = this;

    return _asyncToGenerator(function* () {

      if (queue_name === null || payload === null) {
        throw new Error('Queue name and payload is required, as first and second params');
      }

      let self = _this3;
      let channel = yield _this3.MessagingChannel.create(_this3.settings.connection.host, _this3.settings.connection.options.user, _this3.settings.connection.options.pass);

      yield channel.assertQueue(queue_name, { durable: durable });

      _this3.stringify_payload = JSON.stringify(payload);

      let the_queue = channel.sendToQueue(queue_name, new Buffer(_this3.stringify_payload), { persistent: persistent });
    })();
  }

  queue_worker(queue_name = null, prefetch = 3, durable = true) {
    var _this4 = this;

    return _asyncToGenerator(function* () {

      if (queue_name === null) {
        throw new Error('Queue name is required, as the first params');
      }

      let self = _this4;
      let channel = yield _this4.MessagingChannel.create(_this4.settings.connection.host, _this4.settings.connection.options.user, _this4.settings.connection.options.pass);

      yield channel.assertQueue(queue_name, { durable: durable });

      channel.prefetch(prefetch);

      channel.consume(queue_name, function (msg) {
        if (msg !== null) {
          // events[queue_name](msg.content);
          ch.ack(msg);
        }
      }, { noAck: false });
    })();
  }

  rpc_client(queue_name = null, payload = null, correlationId = null, response_activity = null) {
    var _this5 = this;

    return _asyncToGenerator(function* () {

      if (queue_name === null || payload === null) {
        throw new Error('Queue name and payload is required, as first and second params');
      }

      if (correlationId === null || response_activity === null) {
        throw new Error('correlationId and response_activity is required, as third and fourth params');
      }

      let self = _this5;

      let channel = yield self.MessagingChannel.create(_this5.settings.connection.host, _this5.settings.connection.options.user, _this5.settings.connection.options.pass);

      let q = yield channel.assertQueue('', { exclusive: true });

      channel.consume(q.queue, (() => {
        var _ref2 = _asyncToGenerator(function* (msg) {
          if (msg.properties.correlationId === correlationId) {
            yield response_activity(msg, channel);
            self.successful_rpc = true;
          }
        });

        return function (_x) {
          return _ref2.apply(this, arguments);
        };
      })(), { noAck: true });

      self.stringify_payload = JSON.stringify(payload);

      let the_queue = channel.sendToQueue(queue_name, new Buffer(self.stringify_payload), { correlationId: correlationId, replyTo: q.queue });
    })();
  }

  rpc_server(queue_name = null, activity = null, prefetch = 3) {
    var _this6 = this;

    return _asyncToGenerator(function* () {
      if (queue_name === null || activity === null) {
        throw new Error('Queue name and activity is required, as the first and second params');
      }

      let self = _this6;
      let channel = yield _this6.MessagingChannel.create(_this6.settings.connection.host, _this6.settings.connection.options.user, _this6.settings.connection.options.pass);

      yield channel.assertQueue(queue_name, { durable: false });

      channel.prefetch(prefetch);

      channel.consume(queue_name, (() => {
        var _ref3 = _asyncToGenerator(function* (msg) {
          yield activity(msg, channel);
        });

        function reply(_x2) {
          return _ref3.apply(this, arguments);
        }

        return reply;
      })());
    })();
  }

  receive(queue_name, callback) {
    var _this7 = this;

    return _asyncToGenerator(function* () {
      if (!queue_name || !callback) {
        throw new TypeError();
      }
      let self = _this7;

      let channel = yield _this7.MessagingChannel.create(_this7.settings.connection.host, _this7.settings.connection.options.user, _this7.settings.connection.options.pass);

      yield channel.assertQueue(queue_name);
      channel.consume(queue_name, function (msg) {
        if (msg !== null) {
          channel.ack(msg);
          callback(msg);
        } else {
          callback();
        }
      });
    })();
  }

  //DEPRECATED: renamed to receive
  subscribe(queue_name, callback) {
    var _this8 = this;

    return _asyncToGenerator(function* () {
      let self = _this8;

      let channel = yield _this8.MessagingChannel.create(_this8.settings.connection.host, _this8.settings.connection.options.user, _this8.settings.connection.options.pass);

      yield channel.assertQueue(queue_name);
      channel.consume(queue_name, function (msg) {
        if (msg !== null) {
          console.info(msg.content.toString());
          // events[queue_name](msg.content);
          channel.ack(msg);
          callback(msg);
        }
      });
    })();
  }

}exports.MessagingAction = MessagingAction;
;
//# sourceMappingURL=action.helper.js.map