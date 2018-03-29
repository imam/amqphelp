const amqphelp = require('./bootstrap.js');

async function amq(){
    let halo = await amqphelp.ask('chat', 'read_chatroom', {
        filter: {
            employer_id: '53c6a29d616e7469d7000000'
        }
    })

    console.log(halo)
}

amq()