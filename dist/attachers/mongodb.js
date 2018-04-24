'use strict';

var _bind = require('./bind.js');

var _bind2 = _interopRequireDefault(_bind);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // const Bind = require('./bind.js')


module.exports = class MongoDB extends _bind2.default {

    create(queue_name, schema_name, current_service, service_to, schema, amqp, options) {

        if (!queue_name) {
            throw new Error('queue_name is not defined');
        }

        if (!schema_name) {
            throw new Error('schema_name is not defined');
        }

        if (!current_service) {
            throw new Error('current_service is not defined');
        }

        if (!service_to) {
            throw new Error('service_to is not defined');
        }

        if (!schema) {
            throw new Error('schema is not defined');
        }

        if (!amqp) {
            throw new Error('amqp is not defined');
        }

        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'save');
    }

    update(queue_name, schema_name, current_service, service_to, schema, amqp, options) {

        if (!queue_name) {
            throw new Error('queue_name is not defined');
        }

        if (!schema_name) {
            throw new Error('schema_name is not defined');
        }

        if (!current_service) {
            throw new Error('current_service is not defined');
        }

        if (!service_to) {
            throw new Error('service_to is not defined');
        }

        if (!schema) {
            throw new Error('schema is not defined');
        }

        if (!amqp) {
            throw new Error('amqp is not defined');
        }

        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'update');
    }

    delete(queue_name, schema_name, current_service, service_to, schema, amqp, options) {

        if (!queue_name) {
            throw new Error('queue_name is not defined');
        }

        if (!schema_name) {
            throw new Error('schema_name is not defined');
        }

        if (!current_service) {
            throw new Error('current_service is not defined');
        }

        if (!service_to) {
            throw new Error('service_to is not defined');
        }

        if (!schema) {
            throw new Error('schema is not defined');
        }

        if (!amqp) {
            throw new Error('amqp is not defined');
        }

        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'remove');
    }

    _sendToAmqp(amqp, queue_name, doc) {
        return _asyncToGenerator(function* () {

            if (!amqp) {
                throw new Error('amqp is not defined');
            }

            if (!queue_name) {
                throw new Error('queue_name is not defined');
            }

            if (!doc) {
                throw new Error('doc is not defined');
            }

            yield amqp.actions.send(queue_name, doc);
        })();
    }

    _attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, method) {

        if (!queue_name) {
            throw new Error('queue_name is not defined');
        }

        if (!schema_name) {
            throw new Error('schema_name is not defined');
        }

        if (!current_service) {
            throw new Error('current_service is not defined');
        }

        if (!service_to) {
            throw new Error('service_to is not defined');
        }

        if (!schema) {
            throw new Error('schema is not defined');
        }

        if (!amqp) {
            throw new Error('amqp is not defined');
        }

        if (!method) {
            throw new Error('method is not defined');
        }

        let self = this;
        return new Promise((() => {
            var _ref = _asyncToGenerator(function* (resolve) {
                if (method == 'save') {
                    schema.pre('save', function (next) {
                        this.wasNew = this.isNew;
                        next();
                    });
                }
                schema.post(method, (() => {
                    var _ref2 = _asyncToGenerator(function* (doc, next) {
                        if (!doc.wasNew && method == 'save') {
                            queue_name = queue_name.replace('create_', 'update_');
                        }
                        yield self._populator(doc, options, service_to);
                        yield self._sendToAmqp(amqp, queue_name, doc);
                        yield self._depopulator(doc, options, service_to);

                        next();
                        resolve();
                    });

                    return function (_x2, _x3) {
                        return _ref2.apply(this, arguments);
                    };
                })());
            });

            return function (_x) {
                return _ref.apply(this, arguments);
            };
        })());
    }

    _populator(doc, options, service_to) {
        var _this = this;

        return _asyncToGenerator(function* () {

            if (!doc) {
                throw new Error('doc is not defined');
            }

            if (!service_to) {
                throw new Error('service_to is not defined');
            }

            options = _this._getCurrentServiceToOptions(options, service_to);

            if (options) {
                _lodash2.default.each(options.populate, (() => {
                    var _ref3 = _asyncToGenerator(function* (value) {
                        yield doc.populate(value);
                    });

                    return function (_x4) {
                        return _ref3.apply(this, arguments);
                    };
                })());
                yield doc.execPopulate();
            }
        })();
    }

    _depopulator(doc, options, service_to) {
        var _this2 = this;

        return _asyncToGenerator(function* () {

            if (!doc) {
                throw new Error('doc is not defined');
            }

            if (!service_to) {
                throw new Error('service_to is not defined');
            }

            options = _this2._getCurrentServiceToOptions(options, service_to);

            if (options) {
                _lodash2.default.each(options.populate, (() => {
                    var _ref4 = _asyncToGenerator(function* (field_to_populate) {
                        yield doc.depopulate(field_to_populate);
                    });

                    return function (_x5) {
                        return _ref4.apply(this, arguments);
                    };
                })());
            }
        })();
    }

    _getCurrentServiceToOptions(options, service_to) {

        if (!service_to) {
            throw new Error('service_to is not defined');
        }

        let data = (0, _lodash2.default)(options).filter(_lodash2.default.isPlainObject).filter(value => value.populate).filter(value => value.name == service_to).value()[0];
        if (data) {
            return data;
        } else {
            return null;
        }
    }

};
//# sourceMappingURL=mongodb.js.map