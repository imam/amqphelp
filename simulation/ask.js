const amqphelp = require('./bootstrap.js');

async function amq(){
    let halo = await amqphelp.ask('amqphelp', 'ask_to_multiply', {value: 5})
    let halo2 = await amqphelp.ask('amqphelp', 'ask_to_multiply', {value: 10})

    console.log(halo)
    console.log(halo2)
}

amq()