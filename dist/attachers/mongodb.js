'use strict';

var _bind = require('./bind.js');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } // const Bind = require('./bind.js')


module.exports = class MongoDB extends _bind2.default {

    create(queue_name, schema, amqp) {
        return new Promise((resolve, reject) => {
            schema.pre('save', (() => {
                var _ref = _asyncToGenerator(function* (next) {
                    yield amqp.actions.send(queue_name, this);
                    next();
                    resolve();
                });

                return function (_x) {
                    return _ref.apply(this, arguments);
                };
            })());
        });
    }

    update(queue_name, schema, amqp) {
        return new Promise((resolve, reject) => {
            schema.post('update', (() => {
                var _ref2 = _asyncToGenerator(function* (doc, next) {
                    yield amqp.actions.send(queue_name, {
                        id: this._conditions._id,
                        update: this._update
                    });
                    next();
                    resolve();
                });

                return function (_x2, _x3) {
                    return _ref2.apply(this, arguments);
                };
            })());
        });
    }

    delete(queue_name, schema, amqp) {
        return new Promise((() => {
            var _ref3 = _asyncToGenerator(function* (resolve) {
                schema.post('remove', (() => {
                    var _ref4 = _asyncToGenerator(function* (doc, next) {
                        yield amqp.actions.send(queue_name, this);
                        next();
                        resolve();
                    });

                    return function (_x5, _x6) {
                        return _ref4.apply(this, arguments);
                    };
                })());
            });

            return function (_x4) {
                return _ref3.apply(this, arguments);
            };
        })());
    }

};
//# sourceMappingURL=mongodb.js.map