'use strict';

var _statuses = require('./statuses.helper');

var _statuses2 = _interopRequireDefault(_statuses);

var _channel = require('./channel.helper');

var _action = require('./action.helper');

var _util = require('./util.helper');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let chance = require('chance');

module.exports = class Base {
    constructor({ settings }) {
        this.utils = new _util.MessagingUtil();
        this.settings = settings;
        this.messagingChannel = new _channel.MessagingChannel({ utils: this.utils });
        this.actions = new _action.MessagingAction({ settings: this.settings, utils: this.utils, MessagingChannel: this.messagingChannel });
        this.statuses = _statuses2.default;
        this._attacher = [];
        this.service_name = process.env.npm_package_name;

        this.chance = new chance();
    }

    _getAttacher(attacher_name) {
        if (!attacher_name) {
            throw new TypeError('attacher_name is not defined');
        }

        return _lodash2.default.findLast(this._attacher, { name: attacher_name });
    }

    /**
     * Register the current service name
    */
    registerServiceName(service_name) {
        if (!service_name) {
            throw new TypeError('service_name is not defined');
        }

        return this.service_name = service_name;
    }

    /**
     * Add attacher to singleton
     *
     * @param {string} name Attachers name
     * @param {object} attacher Object
     */
    registerAttacher(name, attacher) {

        if (!name) {
            throw new TypeError('name is not defined');
        }

        if (!attacher) {
            throw new TypeError('attacher is not defined');
        }

        this._attacher.push({
            name,
            attacher
        });
    }

    /**
     * Model to send
     *
     * @param {string} attacher_name
     * @param {string} schema Model schema
     * @param {string} services Services to send the message to
     */
    model(attacher_name, schema_name, schema, services_to) {
        if (!attacher_name) {
            throw new Error('Attacher name is empty');
        }
        if (!schema_name) {
            throw new Error('Schema name is empty');
        }
        if (!schema) {
            throw new Error('Schema is empty');
        }
        if (!services_to) {
            throw new Error('Services to send is empty');
        }
        let attacher = this._getAttacher(attacher_name);

        let options = services_to;
        services_to = this._servicesToMapper(services_to);

        this._attachToAttacher(attacher, schema_name, schema, services_to, options);
    }

    _attachToAttacher(attacher, schema_name, schema, services_to, options) {

        if (!attacher) {
            throw new Error('attacher is not defined');
        }

        if (!schema_name) {
            throw new Error('schema_name is not defined');
        }

        if (!schema) {
            throw new Error('schema is not defined');
        }

        if (!services_to) {
            throw new Error('services_to is not defined');
        }

        let self = this;
        let current_service = this.service_name;

        _lodash2.default.map(services_to, service => {
            attacher.attacher.create(`create_${schema_name}_from_${current_service}_for_${service}`, schema_name, current_service, service, schema, self, options);
            attacher.attacher.update(`update_${schema_name}_from_${current_service}_for_${service}`, schema_name, current_service, service, schema, self, options);
            attacher.attacher.delete(`delete_${schema_name}_from_${current_service}_for_${service}`, schema_name, current_service, service, schema, self, options);
        });
    }

    // Get all services name and map it into single array
    _servicesToMapper(services_to) {
        if (!services_to) {
            throw new Error('services_to is not defined');
        }
        return (0, _lodash2.default)(services_to).map(service => {
            if (_lodash2.default.isPlainObject(service)) {
                if (service.name) {
                    return service.name;
                }
                throw new Error('Name is not defined in object');
            }
            return service;
        }).value();
    }

    /**
    * Receiver from model entity
    */
    modelReceive(receiver) {
        if (!receiver) {
            throw new TypeError('receiver is not defined');
        }
        receiver._init(this);
    }

    ask(service, action, payload) {
        if (!service) {
            throw new TypeError('service is not defined');
        }
        if (!action) {
            throw new TypeError('action is not defined');
        }
        if (!payload) {
            throw new TypeError('payload is not defined');
        }
        return new Promise(resolve => {
            let correlation = this.chance.geohash();
            this.actions.rpc_client(`ask_${action}_from_${service}`, payload, correlation, response => {
                resolve(JSON.parse(response.content.toString()));
            });
        });
    }

    answer(action, callback) {
        if (!action) {
            throw new TypeError('action is not defined');
        }
        if (!callback) {
            throw new TypeError('callback is not defined');
        }
        this.actions.rpc_server(`ask_${action}_from_${this.service_name}`, (() => {
            var _ref = _asyncToGenerator(function* (msg, channel) {
                let callback_result = yield callback(JSON.parse(msg.content.toString()));
                if (!callback_result) {
                    callback_result = true;
                }
                channel.sendToQueue(msg.properties.replyTo, new Buffer(JSON.stringify(callback_result)), { correlationId: msg.properties.correlationId });
                channel.ack(msg);
            });

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        })());
    }

};
//# sourceMappingURL=base.js.map