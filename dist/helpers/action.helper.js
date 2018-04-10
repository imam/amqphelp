'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

//TODO:: Add deeper unit test on subscribe, publish and ping
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

    /**
     * async send - send simple payload to specify queue,
     *              used together with async RECEIVE
     * @param  {String} queue_name      queue name
     * @param  {Any} queue_message      the payload
     * @return {Promise}                promise of true
     */
    send(queue_name, queue_message) {
        var _this = this;

        return _asyncToGenerator(function* () {

            if (queue_name === undefined || queue_message === undefined) {
                throw new Error('Queue name and queue message is undefined');
            }

            let self = _this;

            let channel = yield _this.MessagingChannel.create(_this.settings.connection.host, _this.settings.connection.options.user, _this.settings.connection.options.pass);

            yield channel.assertQueue(queue_name);

            let output = JSON.stringify(queue_message);

            let the_queue = yield channel.sendToQueue(queue_name, new Buffer(output));

            yield channel.close();

            if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${output}'`);

            return true;
        })();
    }

    /**
     * async receive - receive simple payload from the queue,
     *                 used together with async SEND
     * @param  {String} queue_name    queue name
     * @param  {Function} callback    callback function with params(payload)
     */
    receive(queue_name, callback) {
        var _this2 = this;

        return _asyncToGenerator(function* () {

            if (!queue_name || !callback) {
                throw new TypeError();
            }

            let self = _this2;

            let channel = yield _this2.MessagingChannel.create(_this2.settings.connection.host, _this2.settings.connection.options.user, _this2.settings.connection.options.pass);

            yield channel.assertQueue(queue_name);
            channel.consume(queue_name, function (msg) {
                if (msg !== null) {
                    channel.ack(msg);
                    callback(JSON.parse(msg.content.toString()));
                }
            });
        })();
    }

    /**
     * async create_task - request some task to be done, not waiting for the result,
     *                     but will try to recover task if worker failed to process the work,
     *                     used to together with create_task
     *
     * @param  {type} queue_name=null description
     * @param  {type} payload=null    description
     * @param  {type} durable=true    description
     * @param  {type} persistent=true description
     * @return {type}                 description
     */
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

    /**  
     * async queue_worker - setup service worker for processing some task,
     *                      used to together with create_task
     *
     * @param  {type} queue_name=null description
     * @param  {type} prefetch=3      description
     * @param  {type} durable=true    description
     * @return {type}                 description
     */
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

    /**
     * async rpc_client - request some task to be done from rpc_server and wait for the result,
     *                    used together with rpc_server
     *
     * @param  {String} queue_name=null           description
     * @param  {Any} payload=null                 description
     * @param  {String} correlationId=null        description
     * @param  {Function} callback=null  description
     */
    rpc_client(queue_name = null, payload = null, correlationId = null, callback = null) {
        var _this5 = this;

        return _asyncToGenerator(function* () {

            if (queue_name === null || payload === null) {
                throw new Error('Queue name and payload is required, as first and second params');
            }

            if (correlationId === null || callback === null) {
                throw new Error('correlationId and callback is required, as third and fourth params');
            }

            let self = _this5;

            let channel = yield self.MessagingChannel.create(_this5.settings.connection.host, _this5.settings.connection.options.user, _this5.settings.connection.options.pass);

            let q = yield channel.assertQueue('', { exclusive: true });

            channel.consume(q.queue, (() => {
                var _ref = _asyncToGenerator(function* (msg) {
                    if (msg.properties.correlationId === correlationId) {
                        yield callback(msg, channel);
                        self.successful_rpc = true;
                    }
                });

                return function (_x) {
                    return _ref.apply(this, arguments);
                };
            })(), { noAck: true });

            self.stringify_payload = JSON.stringify(payload);

            let the_queue = channel.sendToQueue(queue_name, new Buffer(self.stringify_payload), { correlationId: correlationId, replyTo: q.queue });
        })();
    }

    /**
     * async rpc_server - setup service service server for processing some task then give response immediately after finished,
     *                    used together with rpc_client
     *
     * @param  {type} queue_name=null description
     * @param  {type} activity=null   description
     * @param  {type} prefetch=3      description
     * @return {type}                 description
     */
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
                var _ref2 = _asyncToGenerator(function* (msg) {
                    yield activity(msg, channel);
                });

                function reply(_x2) {
                    return _ref2.apply(this, arguments);
                }

                return reply;
            })());
        })();
    }

    publish(exchange_name, exchange_message) {
        var _this7 = this;

        return _asyncToGenerator(function* () {

            if (!exchange_name) {
                throw new Error('exchange_name is not defined');
            }

            if (!exchange_message) {
                throw new Error('exchange_message is not defined');
            }

            let self = _this7;

            let channel = yield _this7.MessagingChannel.create(_this7.settings.connection.host, _this7.settings.connection.options.user, _this7.settings.connection.options.pass);

            channel.assertExchange(exchange_name, 'fanout', { durable: false });

            let output = JSON.stringify(exchange_message);

            channel.publish(exchange_name, '', new Buffer(output));

            if (process.env == "test") {
                console.log(`[o] sent '${output}'`);
            }

            return true;
        })();
    }

    subscribe(exchange_name, callback) {
        var _this8 = this;

        return _asyncToGenerator(function* () {

            if (!exchange_name) {
                throw new Error("exchange_name is not defined");
            }

            if (!callback) {
                throw new Error("callback is not defined");
            }

            let self = _this8;

            let channel = yield _this8.MessagingChannel.create(_this8.settings.connection.host, _this8.settings.connection.options.user, _this8.settings.connection.options.pass);

            channel.assertExchange(exchange_name, 'fanout', { durable: false });

            let queue_name = yield channel.assertQueue('', { exclusive: true });

            yield channel.bindQueue(queue_name.queue, exchange_name, '');

            channel.consume(queue_name.queue, function (msg) {
                callback(JSON.parse(msg.content.toString()));
            }, { noAck: true });
        })();
    }

    ping(ping_interval = 3000) {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            let self = _this9;

            let queue_name = `${process.env.npm_package_name}_heartbeat`;

            let interval = yield setInterval(_asyncToGenerator(function* () {

                self.ping_count++;

                yield _this9.publish(`${process.env.npm_package_name}_heartbeat`, 'beat');
            }), ping_interval);

            return interval;
        })();
    }

}exports.MessagingAction = MessagingAction;
;
//# sourceMappingURL=action.helper.js.map