// const Bind = require('./bind.js')
import Bind from './bind.js'
import _ from 'lodash'

module.exports = class MongoDB extends Bind{
    
    create(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        
        if(!queue_name){
            throw new Error('queue_name is not defined')
        }
        
        if(!schema_name){
            throw new Error('schema_name is not defined')
        }
        
        if(!current_service){
            throw new Error('current_service is not defined')
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        if(!schema){
            throw new Error('schema is not defined')
        }
        
        if(!amqp){
            throw new Error('amqp is not defined')
        }
        
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'save')
    }
    
    update(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        
        if(!queue_name){
            throw new Error('queue_name is not defined')
        }
        
        if(!schema_name){
            throw new Error('schema_name is not defined')
        }
        
        if(!current_service){
            throw new Error('current_service is not defined')
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        if(!schema){
            throw new Error('schema is not defined')
        }
        
        if(!amqp){
            throw new Error('amqp is not defined')
        }
        
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'update')
    }
    
    delete(queue_name, schema_name, current_service, service_to, schema, amqp, options){
        
        if(!queue_name){
            throw new Error('queue_name is not defined')
        }
        
        if(!schema_name){
            throw new Error('schema_name is not defined')
        }
        
        if(!current_service){
            throw new Error('current_service is not defined')
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        if(!schema){
            throw new Error('schema is not defined')
        }
        
        if(!amqp){
            throw new Error('amqp is not defined')
        }
        
        return this._attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, 'remove')
    }
    
    async _sendToAmqp(amqp, queue_name, doc){
        
        if(!amqp){
            throw new Error('amqp is not defined')
        }
        
        if(!queue_name){
            throw new Error('queue_name is not defined')
        }
        
        if(!doc){
            throw new Error('doc is not defined')
        }
        
        await amqp.actions.send(queue_name, doc);
    }
    
    _attachToAmqp(queue_name, schema_name, current_service, service_to, schema, amqp, options, method){
        
        if(!queue_name){
            throw new Error('queue_name is not defined')
        }
        
        if(!schema_name){
            throw new Error('schema_name is not defined')
        }
        
        if(!current_service){
            throw new Error('current_service is not defined')
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        if(!schema){
            throw new Error('schema is not defined')
        }
        
        if(!amqp){
            throw new Error('amqp is not defined')
        }
        
        if(!method){
            throw new Error('method is not defined')
        }
        
        let self = this;
        return new Promise(async (resolve)=>{
            schema.post(method, async function(doc, next){
                
                await self._populator(doc, options, service_to)
                await self._sendToAmqp(amqp, queue_name, doc)
                await self._depopulator(doc, options, service_to);
                
                next();
                resolve();
            })
        })
    }
    
    async _populator(doc, options, service_to){
        
        if(!doc){
            throw new Error('doc is not defined');
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        options = this._getCurrentServiceToOptions(options, service_to);
        
        if(options){
            _.each(options.populate, async value=>{
                await doc.populate(value)
            })
            await doc.execPopulate();
        }
    }
    
    async _depopulator(doc, options, service_to){
        
        if(!doc){
            throw new Error('doc is not defined');
        }
        
        if(!service_to){
            throw new Error('service_to is not defined')
        }
        
        options = this._getCurrentServiceToOptions(options, service_to);
        
        if(options){
            _.each(options.populate, async field_to_populate=>{
                await doc.depopulate(field_to_populate)
            })
        }
    }
    
    _getCurrentServiceToOptions(options, service_to){

        if(!service_to){
            throw new Error('service_to is not defined')
        }

        let data =  _(options)
        .filter(_.isPlainObject)
        .filter(value => value.populate)
        .filter(value => value.name == service_to)
        .value()[0]
        if(data){
            return data
        }else{
            return null
        }
    }
    
}