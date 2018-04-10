
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const base = require(pathfinder.to_app() + '/base')
const _ = require('lodash')
const chance = require('chance')

//TODO::registerServiceName

describe("[ Messaging Helper | Messaging Base ]", function(){
  
  describe(" success call on _getAttacher", ()=>{
    it("should return correctly", ()=>{
      let base_object = new base({settings: {}})
      
      base_object._attacher = [{name: 'test', position: 'first'}, {name: 'test', position: 'second'}, {name: 'test', position: 'last'}, {name: 'test_incorrect'}]
      
      let result = base_object._getAttacher('test')
      
      expect(result.position).to.equal('last')
    })
  })
  
  describe(" error call on _getAttacher", ()=>{
    it("should throw error if attacher_name is not defined", ()=>{
      let base_object = new base({settings: {}})
      
      expect(()=>{base_object._getAttacher(undefined)}).to.throw('attacher_name is not defined')
    })
  })
  
  describe(" success call on register service name function", ()=>{
    it("should set this.service_name", ()=>{
      let base_object = new base({settings: {}})
      
      base_object.registerServiceName('test_service_name')
      
      expect(base_object.service_name).to.equal('test_service_name')
    })
  })
  
  describe(" fail call on registerServiceName", ()=>{
    it("should throw error if service_name is not defined", ()=>{
      let base_object = new base({settings: {}})
      expect(()=>{base_object.registerServiceName(undefined)}).to.throw('service_name is not defined')
    })
  })

  describe(" success call on registerAttacher", ()=>{
    it("should call _attacher.push", ()=>{
      let base_object = new base({settings: {}})
      base_object.registerAttacher('test_name', 'test_attacher')

      expect(base_object._attacher[0].name).to.equal('test_name')
      expect(base_object._attacher[0].attacher).to.equal('test_attacher')
    })
  })

  describe(" fail call on registerAttacher", ()=>{
    it("should throw error if name is not defined", ()=>{
      let base_object = new base({settings: {}})
      expect(()=>{base_object.registerAttacher(undefined, 'test_attacher')}).to.throw('name is not defined')
    })

    it("should throw error if attacher is not defined", ()=>{
      let base_object = new base({settings: {}})
      expect(()=>{base_object.registerAttacher('test_name', undefined)}).to.throw('attacher is not defined')
    })
  })
  
  describe(" success call on model function", ()=>{
    let base_object, _getAttacher_stub, _servicesToMapper_stub, _attachToAttacher_stub;
    
    beforeEach(()=>{
      base_object = new base({settings: {}});
      
      _getAttacher_stub = sinon.stub(base_object, '_getAttacher')
      _getAttacher_stub.returns('test_attacher')
      
      _servicesToMapper_stub = sinon.stub(base_object, '_servicesToMapper')
      _servicesToMapper_stub.returns('test_services_to')
      
      _attachToAttacher_stub = sinon.stub(base_object, '_attachToAttacher')
      
      base_object.model('test_attacher_name', 'test_schema_name','test_schema', 'test_services_to')
    })
    
    it("should call _getAttacher", ()=>{
      expect(_getAttacher_stub.calledOnce).to.true    
      expect(_getAttacher_stub.firstCall.args[0]).to.equal('test_attacher_name')
    })
    
    it('should call _serviceToMapper', ()=>{
      expect(_servicesToMapper_stub.calledOnce).to.true;
      expect(_servicesToMapper_stub.firstCall.args[0]).to.equal('test_services_to')
    })
    
    it("should call _attachToAttacher", ()=>{
      expect(_attachToAttacher_stub.calledOnce).to.true;
      expect(_attachToAttacher_stub.firstCall.args[0]).to.equal('test_attacher');
      expect(_attachToAttacher_stub.firstCall.args[1]).to.equal('test_schema_name');
      expect(_attachToAttacher_stub.firstCall.args[2]).to.equal('test_schema');
      expect(_attachToAttacher_stub.firstCall.args[3]).to.equal('test_services_to');
      expect(_attachToAttacher_stub.firstCall.args[4]).to.equal('test_services_to');
    })
    
  })

  describe(" fail call on model function ", ()=>{
    //TODO:: Be more descriptive about the error messages
    
    it("should throw error if attacher name is empty", ()=>{
      let base_object = new base({settings: {}});
      expect(()=>{base_object.model(undefined, 'a','a', 'a')}).to.throw()
    })
    
    
    it("should throw error if schema name is empty", ()=>{
      let base_object = new base({settings: {}});
      expect(()=>{base_object.model('a', undefined,'a', 'a')}).to.throw()
    })
    
    
    it("should throw error if schema is empty", ()=>{
      let base_object = new base({settings: {}});
      expect(()=>{base_object.model('a', 'a', undefined, 'a')}).to.throw()
    })
    
    it("should throw error if services to send is empty", ()=>{
      let base_object = new base({settings: {}});
      expect(()=>{base_object.model('a', 'a', 'a', undefined,)}).to.throw()
    })
  })
  
  describe(" success call on _attachToAttacher", ()=>{
    let find_last_stub, map_stub, base_object, attacher;
    
    beforeEach(()=>{
      attacher = {
        attacher: {
          create: sinon.stub(),
          update: sinon.stub(),
          delete: sinon.stub()
        }
      }
      
      base_object = new base({settings: {}})
      
      base_object._attachToAttacher(attacher, 'test_schema_name', 'test_schema', ['test_service_to'], 'test_options')
    })
    
    it("should fire create with correct arguments", ()=>{
      expect(attacher.attacher.create.firstCall.args[0]).to.equal('create_test_schema_name_from_amqphelp_for_test_service_to')
      expect(attacher.attacher.create.firstCall.args[1]).to.equal('test_schema_name')
      expect(attacher.attacher.create.firstCall.args[2]).to.equal('amqphelp')
      expect(attacher.attacher.create.firstCall.args[3]).to.equal('test_service_to')
      expect(attacher.attacher.create.firstCall.args[4]).to.equal('test_schema')
      expect(attacher.attacher.create.firstCall.args[6]).to.equal('test_options')
    })
    
    it("should fire update with correct arguments", ()=>{
      expect(attacher.attacher.update.firstCall.args[0]).to.equal('update_test_schema_name_from_amqphelp_for_test_service_to')
      expect(attacher.attacher.update.firstCall.args[1]).to.equal('test_schema_name')
      expect(attacher.attacher.update.firstCall.args[2]).to.equal('amqphelp')
      expect(attacher.attacher.update.firstCall.args[3]).to.equal('test_service_to')
      expect(attacher.attacher.update.firstCall.args[4]).to.equal('test_schema')
      expect(attacher.attacher.update.firstCall.args[6]).to.equal('test_options')
    })
    
    it("should fire delete with correct arguments", ()=>{
      expect(attacher.attacher.delete.firstCall.args[0]).to.equal('delete_test_schema_name_from_amqphelp_for_test_service_to')
      expect(attacher.attacher.delete.firstCall.args[1]).to.equal('test_schema_name')
      expect(attacher.attacher.delete.firstCall.args[2]).to.equal('amqphelp')
      expect(attacher.attacher.delete.firstCall.args[3]).to.equal('test_service_to')
      expect(attacher.attacher.delete.firstCall.args[4]).to.equal('test_schema')
      expect(attacher.attacher.delete.firstCall.args[6]).to.equal('test_options')
    })
  })
  
  describe(" fail call on _attachToAttacher", ()=>{
    let base_object;

    beforeEach(()=>{
      base_object = new base({settings: {}})
    })

    it("should throw error if attacher is not defined", ()=>{
      expect(()=>{base_object._attachToAttacher(undefined, 'test_schema_name', 'test_schema', 'test_services_to', 'test_options')}).to.throw('attacher is not defined')
    })

    it("should throw error if schema_name is not defined", ()=>{
      expect(()=>{base_object._attachToAttacher('test_attacher', undefined, 'test_schema', 'test_services_to', 'test_options')}).to.throw('schema_name is not defined')
    })

    it("should throw error if schema is not defined", ()=>{
      expect(()=>{base_object._attachToAttacher('test_attacher', 'test_schema_name', undefined, 'test_services_to', 'test_options')}).to.throw('schema is not defined')
    })

    it("should throw error if services_to is not defined", ()=>{
      expect(()=>{base_object._attachToAttacher('test_attacher', 'test_schema_name', 'test_schema', undefined, 'test_options')}).to.throw('services_to is not defined')
    })
  })
  
  describe(" success call on model receive function", ()=>{
    
    it("should call _init from receiver", ()=>{
      let base_object = new base({settings: {}});
      let receiver = {
        _init: sinon.stub()
      }
      base_object.modelReceive(receiver);
      
      expect(receiver._init.calledOnce).to.equal(true)
    })
    
  })

  describe(" fail call on _servicesToMapper", ()=>{
    it("should throw error if services_to is not defined", ()=>{
      let base_object = new base({settings: {}})

      expect(()=>{base_object._servicesToMapper(undefined)}).to.throw('services_to is not defined');


    })
  })

  describe(" fail call on model receive function", ()=>{
    it("should throw error if receiver is not defined", ()=>{
      let base_object = new base({settings: {}});
      
      expect(()=>{base_object.modelReceive(undefined)}).to.throw('receiver is not defined')
    })
  })
  
  describe(" success call on _servicesToMapper", ()=>{
    it("should successfully map service_name", ()=>{
      let base_object = new base({settings: {}})
      
      let result = base_object._servicesToMapper(['test_service_to', {name: 'test_service_to_2'}])
      
      expect(result[0]).to.equal('test_service_to')
      expect(result[1]).to.equal('test_service_to_2')
      
    })
  })

  
  describe(" success call on ask", ()=>{
    
    let geohash_stub, base_object;
    
    beforeEach(async ()=>{
      base_object = new base({settings: {}})
      
      geohash_stub = sinon.stub(base_object.chance, 'geohash')
      
      geohash_stub.returns('test_geohash')
      
      base_object.actions.rpc_client = sinon.stub()
      
      base_object.actions.rpc_client.callsFake((queue_name, payload, correlation, callback)=>{
        callback({content: '"halo"'})
      })
      
      await base_object.ask('test_service_name', 'test_action','test_payload')
    })    
    
    it("should call chance.geohash", ()=>{
      expect(base_object.actions.rpc_client.calledOnce).to.true
    })
    
    it("should call rpc_client", ()=>{
      expect(base_object.actions.rpc_client.firstCall.args[0]).to.equal('ask_test_action_from_test_service_name')
      expect(base_object.actions.rpc_client.firstCall.args[1]).to.equal('test_payload')
      expect(base_object.actions.rpc_client.firstCall.args[2]).to.equal('test_geohash')
    })
    
    afterEach(()=>{
      geohash_stub.restore();
    })
  })
  
  describe(" error call on ask", ()=>{
    let base_object;
    
    beforeEach(()=>{
      base_object = new base({settings: {}})
    })
    
    it("should throw error if service is not defined", ()=>{
      expect(()=>{base_object.ask(undefined, 'test_action', 'test_payload')}).to.throw('service is not defined')
    })
    
    it("should throw error if action is not defined", ()=>{
      expect(()=>{base_object.ask('test_service', undefined, 'test_payload')}).to.throw('action is not defined')
    })
    
    it("should throw error if payload is not defined", ()=>{
      expect(()=>{base_object.ask('test_service', 'test_action', undefined)}).to.throw('payload is not defined')
    })
  })
  
  describe(" success call on answer", ()=>{
    
    let base_object, callback_stub, channel_stub;
    
    beforeEach(async ()=>{
      base_object = new base({settings: {}})
      
      base_object.actions.rpc_server = sinon.stub();
      
      channel_stub = sinon.stub({
        sendToQueue(){ return 1},
        ack(){ return 1}
      });
      
      base_object.actions.rpc_server.callsFake((queue_name, callback)=>{
        callback({content: '"test"', properties: {replyTo: 'test_reply_to', correlationId: 'test_correlationId'}}, channel_stub);
      })
      
      callback_stub = sinon.stub();
      
      await base_object.answer('test_action', callback_stub);
    })
    
    it("should call actions.rpc_server", ()=>{
      expect(base_object.actions.rpc_server.firstCall.args[0]).to.equal('ask_test_action_from_amqphelp')
    })
    
    it("should call callback", ()=>{
      expect(callback_stub.calledOnce).to.true
      expect(callback_stub.firstCall.args[0]).to.equal('test')
    })
    
    it("should call sendToQueue", ()=>{
      expect(channel_stub.sendToQueue.calledOnce).to.true
      expect(channel_stub.sendToQueue.firstCall.args[0]).to.equal('test_reply_to')
      expect(channel_stub.sendToQueue.firstCall.args[1].toString()).to.equal('true')
      expect(channel_stub.sendToQueue.firstCall.args[2].correlationId).to.equal('test_correlationId')
    })
    
    it("should call ack", ()=>{
      expect(channel_stub.ack.calledOnce).to.true
      expect(channel_stub.ack.firstCall.args[0].content).to.equal('"test"')
      expect(channel_stub.ack.firstCall.args[0].properties.replyTo).to.equal('test_reply_to')
      expect(channel_stub.ack.firstCall.args[0].properties.correlationId).to.equal('test_correlationId')
    })
  })
  
  describe("error call on answer", ()=>{
    let base_object;
    
    beforeEach(()=>{
      base_object = new base({settings: {}})
    })
    
    it("should throw error if payload is not defined", ()=>{
      expect(()=>{base_object.answer(undefined, 'test_callback')}).to.throw('action is not defined')
    })
    
    it("should throw error if callback is not defined", ()=>{
      expect(()=>{base_object.answer('test_action', undefined)}).to.throw('callback is not defined')
    })
  })
  
});
