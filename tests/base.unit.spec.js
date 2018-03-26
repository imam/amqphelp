
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const base = require(pathfinder.to_app() + '/base')
const _ = require('lodash')
const chance = require('chance')

//TODO::registerServiceName

describe("[ Messaging Helper | Messaging Base ]", function(){
  describe(" success call on register service name function", ()=>{
    it("should set this.service_name", ()=>{
      let base_object = new base({settings: {}})
      
      base_object.registerServiceName('test_service_name')
      
      expect(base_object.service_name).to.equal('test_service_name')
    })
  })
  
  describe(" success call on model function", ()=>{
    let find_last_stub, map_stub, base_object;
    
    beforeEach(()=>{
      find_last_stub = sinon.stub(_, 'findLast')
      map_stub = sinon.stub(_, 'map')
      
      base_object = new base({settings: {}});
      base_object.model('a', 'a','a', 'a')
    })
    
    it("should fire findlast", ()=>{
      expect(find_last_stub.calledOnce).to.equal(true)
    })
    
    it("should fire map", ()=>{
      expect(map_stub.calledOnce).to.equal(true)
    })
    
    afterEach(()=>{
      find_last_stub.restore()
      map_stub.restore()
    })
  })
  
  describe(" success call on model function | map |", ()=>{
    let find_last_stub, map_stub, base_object, attacher;
    
    beforeEach(()=>{
      
      attacher = {
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub()
      }
      
      find_last_stub = sinon.stub(_, 'findLast').returns({
        attacher
      })
      
      map_stub = sinon.stub(_, 'map').callsFake((__, value)=>{
        value('test');
      })
      
      base_object = new base({settings: {}})
      base_object.model('a', 'schema_name', 'schema', ['a'])
    })
    
    it("should fire create with correct arguments", ()=>{
      expect(attacher.create.firstCall.args[0]).to.equal('create_schema_name_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema_name')
    })
    
    it("should fire update with correct arguments", ()=>{
      expect(attacher.update.firstCall.args[0]).to.equal('update_schema_name_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema_name')
    })
    
    it("should fire update with correct arguments", ()=>{
      expect(attacher.update.firstCall.args[0]).to.equal('update_schema_name_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema_name')
    })
    
    afterEach(()=>{
      find_last_stub.restore();
      map_stub.restore();
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
        callback({content: 'halo'})
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
  
});
