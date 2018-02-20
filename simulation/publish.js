const amqphelp = require('./bootstrap.js');

console.log(amqphelp.actions.publish('test_pubsub', {test: 'aja'}));
