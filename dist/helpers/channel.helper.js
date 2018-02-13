"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

  create(hostname = null, broker_user = null, broker_pass = null, retry_connection_time, retry_limit) {
    var _this = this;

    return _asyncToGenerator(function* () {
      if (process.env.NODE_ENV === "test") {
        retry_limit = retry_limit || 0;
      } else {
        retry_limit = retry_limit || 3;
      }

      if (_this.retry_time > 0) {
        if (process.env.NODE_ENV !== "test") console.info(`Retry ${_this.retry_time} connecting to broker`);
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
        _this.connection = yield _this.ampql.connect(amqp_path);
      } catch (e) {
        if (e.isOperational) {
          retry_connection = true;
        } else {
          throw e;
        }
      }

      if (_this.connection) {
        try {
          _this.channel = yield _this.connection.createChannel();
          return _this.channel;
        } catch (e) {
          throw e;
        }
      } else {
        // do retry
        if (retry_connection && _this.retry_time < retry_limit) {
          _this.retry_time++;

          yield _this.utils.sleep(retry_connection_time, 'Retry broker connection');
          _this.channel = yield _this.create(hostname, broker_user, broker_pass, retry_connection_time, retry_limit);
          return _this.channel;
        } else {
          if (_this.retry_time > 0) {
            throw new Error(`failed to create channel after retry ${_this.retry_time} times`);
          } else {
            throw new Error('failed to create channel');
          }
        }
      }
    })();
  }

}exports.MessagingChannel = MessagingChannel;
;
//# sourceMappingURL=channel.helper.js.map