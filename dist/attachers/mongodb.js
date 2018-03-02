'use strict';

var _bind = require('./bind.js');

var _bind2 = _interopRequireDefault(_bind);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = class MongoDB extends _bind2.default {

    create(queue_name, schema, amqp) {
        schema.pre('save', function (next) {
            amqp.actions.send(queue_name, this);
            next();
        });
    }

    update(queue_name, schema, amqp) {
        let self = this;
        schema.post('update', function (next) {
            amqp.actions.send(queue_name, {
                id: self._conditions._id,
                update: self._update
            });
            next();
        });
    }

    delete(queue_name, schema, amqp) {
        schema.post('remove', function (next) {
            amqp.actions.send(queue_name, this);
            next();
        });
    }

}; // const Bind = require('./bind.js')
//# sourceMappingURL=mongodb.js.map