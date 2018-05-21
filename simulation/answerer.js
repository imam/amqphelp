const amqphelp = require('./bootstrap.js');

async function amq(){
    await amqphelp.answer('ask_to_multiply', msg=>{
        let result = msg.value*msg.value;
        return result;
    })
}

amq()