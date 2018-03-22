let amqphelp = require('./bootstrap.js');

let m = amqphelp.model('halo_dunia');

console.log(m)

m.create({halo: 'dunia!'})
