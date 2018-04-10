'use strict';

module.exports = class AmqpReceiver {
    constructor() {
        this.register();
        this.service_name = process.env.npm_package_name;
    }

    register() {
        this.receive_from = '';
        this.payload_name = '';
        this.amqp = null;
    }

    _init(amqp) {
        if (!amqp) {
            throw new Error('amqp is not defined');
        }
        this.amqp = amqp;
        this.create();
        this.update();
        this.delete();
    }

    create() {
        this.receiveCreate();
    }

    update() {
        this.receiveUpdate();
    }

    delete() {
        this.receiveDelete();
    }

    receiveCreate(callback) {
        if (!callback) {
            callback = value => {
                console.log(value, 'on_create');
            };
        }
        this.amqp.actions.receive(`create_${this.payload_name}_from_${this.receive_from}_for_${this.service_name}`, callback);
    }

    receiveUpdate(callback) {
        if (!callback) {
            callback = value => {
                console.log(value, 'on_update');
            };
        }
        this.amqp.actions.receive(`update_${this.payload_name}_from_${this.receive_from}_for_${this.service_name}`, callback);
    }

    receiveDelete(callback) {
        if (!callback) {
            callback = value => {
                console.log(value, 'on_delete');
            };
        }
        this.amqp.actions.receive(`delete_${this.payload_name}_from_${this.receive_from}_for_${this.service_name}`, callback);
    }
};
//# sourceMappingURL=receiver.js.map