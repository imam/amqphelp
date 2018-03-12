// const Bind = require('./bind.js')
import Bind from './bind.js'

module.exports = class MongoDB extends Bind{
    
    create(queue_name, schema, amqp){
        return new Promise((resolve, reject)=>{
            schema.pre('save', async function(next){
                await amqp.actions.send(queue_name, this)
                next();
                resolve();
            })
        })
    }
    
    update(queue_name, schema, amqp){
        return new Promise((resolve, reject)=>{
            schema.post('update', async function(){
                await amqp.actions.send(queue_name, {
                    id: this._conditions._id,
                    update: this._update
                })
                resolve();
            })
        })
    }
    
    delete(queue_name, schema, amqp){
        return new Promise(async (resolve)=>{
            schema.post('remove', async function(){
                await amqp.actions.send(queue_name, this);
                resolve();
            })
        })
    }
    
}