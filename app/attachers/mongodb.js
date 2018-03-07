// const Bind = require('./bind.js')
import Bind from './bind.js'

module.exports = class MongoDB extends Bind{

    create(queue_name, schema, amqp){
        schema.pre('save', function(next){
            amqp.actions.send(queue_name, this)
            next();
        })
    }
    
    update(queue_name, schema, amqp){
        let self = this;
        schema.post('update', function(){
            amqp.actions.send(queue_name, {
                id: self._conditions._id,
                update: self._update
            })
        })
    }

    delete(queue_name, schema, amqp){
        schema.post('remove', function(){
            amqp.actions.send(queue_name, this)
        })
    }

}