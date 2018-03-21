
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const base = require(pathfinder.to_app() + '/base')
const _ = require('lodash')

//TODO::registerServiceName

describe("[ Messaging Helper | Register attacher]", ()=>{
  describe(" success call on register attacher function", ()=>{
    //TODO::_atttacher.push()
  })
})

describe("[ Messaging Helper | Messaging Base ]", function(){
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
  
  describe(" success call on model function | map", ()=>{
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
      base_object.model('a', 'a', 'schema', ['a'])
    })
    
    it("should fire create with correct arguments", ()=>{
      expect(attacher.create.firstCall.args[0]).to.equal('create_a_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema')
    })
    
    it("should fire update with correct arguments", ()=>{
      expect(attacher.update.firstCall.args[0]).to.equal('update_a_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema')
    })
    
    it("should fire update with correct arguments", ()=>{
      expect(attacher.update.firstCall.args[0]).to.equal('update_a_from_amqphelp_for_test')
      expect(attacher.create.firstCall.args[1]).to.equal('schema')
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

    //TODO::error call on _init from receiver

  })

});
