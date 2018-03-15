'use strict';

var _bind = require('./bind.js');

var _bind2 = _interopRequireDefault(_bind);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // const Bind = require('./bind.js')


module.exports = class MongoDB extends _bind2.default {

    create(queue_name, schema_name, current_service, service_to, schema, amqp, options) {
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'save', (() => {
            var _ref = _asyncToGenerator(function* (queue_name, doc) {
                yield amqp.actions.send(queue_name, doc);
            });

            return function (_x, _x2) {
                return _ref.apply(this, arguments);
            };
        })());
    }

    update(queue_name, schema_name, current_service, service_to, schema, amqp, options) {
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'update', (() => {
            var _ref2 = _asyncToGenerator(function* (queue_name, doc) {
                yield amqp.actions.send(queue_name, doc);
            });

            return function (_x3, _x4) {
                return _ref2.apply(this, arguments);
            };
        })());
    }

    delete(queue_name, schema_name, current_service, service_to, schema, amqp, options) {
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'remove', (() => {
            var _ref3 = _asyncToGenerator(function* (queue_name, doc) {
                yield amqp.actions.send(queue_name, doc);
            });

            return function (_x5, _x6) {
                return _ref3.apply(this, arguments);
            };
        })());
    }

    _attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, method, action) {
        let self = this;
        return new Promise((() => {
            var _ref4 = _asyncToGenerator(function* (resolve) {
                schema.post(method, (() => {
                    var _ref5 = _asyncToGenerator(function* (doc, next) {
                        console.log(service_to);

                        yield self._populator(doc, options, service_to);
                        yield action(queue_name, doc);
                        yield self._depopulator(doc, options, service_to);

                        next();
                        resolve();
                    });

                    return function (_x8, _x9) {
                        return _ref5.apply(this, arguments);
                    };
                })());
            });

            return function (_x7) {
                return _ref4.apply(this, arguments);
            };
        })());
    }

    _populator(doc, options, service_to) {
        var _this = this;

        return _asyncToGenerator(function* () {
            // console.log(this._getCurrentServiceToOptions(options, service_to));
            options = _this._getCurrentServiceToOptions(options, service_to);
            if (options) {
                _lodash2.default.each(options.populate, (() => {
                    var _ref6 = _asyncToGenerator(function* (value) {
                        yield doc.populate(value);
                    });

                    return function (_x10) {
                        return _ref6.apply(this, arguments);
                    };
                })());
                yield doc.execPopulate();
            }
        })();
    }

    _depopulator(doc, options, service_to) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            options = _this2._getCurrentServiceToOptions(options, service_to);
            if (options) {
                _lodash2.default.each(options.populate, (() => {
                    var _ref7 = _asyncToGenerator(function* (value) {
                        yield doc.depopulate(value);
                    });

                    return function (_x11) {
                        return _ref7.apply(this, arguments);
                    };
                })());
            }
        })();
    }

    _getCurrentServiceToOptions(options, service_to) {
        let data = (0, _lodash2.default)(options).filter(_lodash2.default.isPlainObject).filter(value => value.populate).filter(value => value.name == service_to).value();
        if (data[0]) {
            return data[0];
        } else {
            return null;
        }
    }

};
//# sourceMappingURL=mongodb.js.map