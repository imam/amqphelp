const amqphelp = require('./bootstrap.js');
let receiver = require('../app/helpers/receiver.js');

class testReceiver extends receiver{
    register(){
        this.service_name = 'chat';
        this.receive_from = 'amqphelp';
        this.payload_name = 'test';
    }

    create(){
        this.receiveCreate(value=>{
            console.log('berhasil!!', value)
        })
    }
}

console.log('receiving...')

amqphelp.modelReceive(new testReceiver)