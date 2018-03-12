"use strict";

module.exports = {
    amqphelp: {
        "connection": {
            "host": process.env.WEB_BROKER_NAME,
            "options": {
                "name": process.env.WEB_BROKER_NAME,
                "cookie": process.env.WEB_BROKER_COOKIE,
                "user": process.env.WEB_BROKER_DEFAULT_USER,
                "pass": process.env.WEB_BROKER_DEFAULT_PASS,
                "vhost": process.env.WEB_BROKER_DEFAULT_VHOST,
                "reconnect": true
            }
        }
    }
};
//# sourceMappingURL=shared.js.map