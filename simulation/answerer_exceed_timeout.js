const amqphelp = require('./bootstrap.js');

async function amq(){
    await amqphelp.answer('ask_to_multiply', async msg=>{
        let result = msg.value*msg.value;

        let process = ()=>{
            return new Promise((resolve)=>{
                setTimeout(() => {
                    resolve();
                }, 5000);
            })
        }

        await process();

        return result;
    })
}

amq()