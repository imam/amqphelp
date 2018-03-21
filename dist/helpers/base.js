'use strict';

var _statuses = require('./statuses.helper');

var _statuses2 = _interopRequireDefault(_statuses);

var _channel = require('./channel.helper');

var _action = require('./action.helper');

var _util = require('./util.helper');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = class Base {
    constructor({ settings }) {
        this.utils = new _util.MessagingUtil();
        this.settings = settings;
        this.messagingChannel = new _channel.MessagingChannel({ utils: this.utils });
        this.actions = new _action.MessagingAction({ settings: this.settings, utils: this.utils, MessagingChannel: this.messagingChannel });
        this.statuses = _statuses2.default;
        this._attacher = [];
        this.service_name = process.env.npm_package_name;
    }

    _getAttacher(attacher_name) {
        return _lodash2.default.findLast(this._attacher, { name: attacher_name });
    }

    /** 
     * Register the current service name
    */
    registerServiceName(service_name) {
        return this.service_name = service_name;
    }

    /**
     * Add attacher to singleton
     * 
     * @param {string} name Attachers name
     * @param {object} attacher Object 
     */
    registerAttacher(name, attacher) {
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
        receiver._init(this);
    }

};
//# sourceMappingURL=base.js.map