const amqphelp = require('./bootstrap.js');

async function amq(){
    await amqphelp.answer('ask_test', msg=>{
        let result = msg.value*msg.value;
        return result;
    })
    let halo = await amqphelp.ask('amqphelp', 'ask_test', {value: 5})
    let halo2 = await amqphelp.ask('amqphelp', 'ask_test', {value: 10})

    console.log(halo)
    console.log(halo2)
}

amq()