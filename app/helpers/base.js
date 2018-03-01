import statuses               from './statuses.helper';
import { MessagingChannel }   from './channel.helper';
import { MessagingAction }    from './action.helper';
import { MessagingUtil }      from './util.helper';
import _ from 'lodash'

module.exports  = class Base{
    constructor({settings}){
        this.utils = new MessagingUtil();
        this.settings = settings;
        this.messagingChannel = new MessagingChannel({ utils: this.utils });
        this.actions = new MessagingAction({ settings: this.settings, utils: this.utils, MessagingChannel: this.messagingChannel });
        this.statuses = statuses;
        this._attacher = [];
        this.service_name = process.env.npm_package_name;
    }
    
    /** 
     * Register the current service name
    */
    registerServiceName(service_name){
        return this.service_name = service_name;
    }

    /**
     * Add attacher to singleton
     * 
     * @param {string} name Attachers name
     * @param {object} attacher Object 
     */
    registerAttacher(name, attacher){
        this._attacher.push({
            name,
            attacher
        })
    }

    /**
     * Model to send
     * 
     * @param {string} attacher_name 
     * @param {string} schema Model schema
     * @param {string} services Services to send the message to
     */
    model(attacher_name, schema_name, schema, services_to){
        if(!attacher_name){
            throw new Error('Attacher name is empty')
        }
        if(!schema_name){
            throw new Error('Schema name is empty')
        }
        if(!schema){
            throw new Error('Schema is empty')
        }
        if(!services_to){
            throw new Error('Services to send is empty')
        }
        let attacher = _.findLast(this._attacher, {name: attacher_name})
        let self = this;
        _.map(services_to, service=>{
            attacher.attacher.create(`create_${schema_name}_from_${this.service_name}_for_${service}`, schema, self)
            attacher.attacher.update(`update_${schema_name}_from_${this.service_name}_for_${service}`, schema, self)
            attacher.attacher.delete(`delete_${schema_name}_from_${this.service_name}_for_${service}`, schema, self)
        })
    }

    /**
     * Receiver from model entity
     */
    modelReceive(receiver){
        receiver._init(this);
    }
    
}