// const Bind = require('./bind.js')
import Bind from './bind.js'
import _ from 'lodash'

module.exports = class MongoDB extends Bind{
    
    create(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'save', async(queue_name, doc)=>{
            await amqp.actions.send(queue_name, doc);
        })
    }
    
    update(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'update', async(queue_name, doc)=>{
            await amqp.actions.send(queue_name, doc)
        })
    }
    
    delete(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'remove', async(queue_name, doc)=>{
            await amqp.actions.send(queue_name, doc);
        })
    }
    
    _attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, method, action){
        let self = this;
        return new Promise(async (resolve)=>{
            schema.post(method, async function(doc, next){
                console.log(service_to);

                await self._populator(doc, options, service_to)
                await action(queue_name, doc)
                await self._depopulator(doc, options, service_to);

                next();
                resolve();
            })
        })
    }
    
    async _populator(doc, options, service_to){
        // console.log(this._getCurrentServiceToOptions(options, service_to));
        options = this._getCurrentServiceToOptions(options, service_to);
        if(options){
            _.each(options.populate, async value=>{
                await doc.populate(value)
            })
            await doc.execPopulate();
        }
    }

    async _depopulator(doc, options, service_to){
        options = this._getCurrentServiceToOptions(options, service_to);
        if(options){
            _.each(options.populate, async value=>{
                await doc.depopulate(value)
            })
        }
    }
    
    _getCurrentServiceToOptions(options, service_to){
        let data =  _(options)
        .filter(_.isPlainObject)
        .filter(value => value.populate)
        .filter(value => value.name == service_to)
        .value()
        if(data[0]){
            return data[0]
        }else{
            return null
        }
    }
    
}