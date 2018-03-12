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
            schema.post('update', _asyncToGenerator(function* () {
                yield amqp.actions.send(queue_name, {
                    id: this._conditions._id,
                    update: this._update
                });
                resolve();
            }));
        });
    }

    delete(queue_name, schema, amqp) {
        return new Promise((() => {
            var _ref3 = _asyncToGenerator(function* (resolve) {
                schema.post('remove', _asyncToGenerator(function* () {
                    yield amqp.actions.send(queue_name, this);
                    resolve();
                }));
            });

            return function (_x2) {
                return _ref3.apply(this, arguments);
            };
        })());
    }

};
//# sourceMappingURL=mongodb.js.map