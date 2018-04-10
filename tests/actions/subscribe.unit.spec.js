import { error } from 'util';

'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_app() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_app() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_app() + "/channel.helper");

const sinon = require('sinon');

function errorArgumentCall(method, args, error_message){
    let thrown_error = false;
    try {
        method(...args)
    } catch(e){
        thrown_error = true;
        expect(e.message).to.equal(error_message)
    }
    if(!thrown_error){
        throw new Error('Error should be thrown')
    }
}

function errorArgumentCallForPromise(method, args, error_message) {
  return method(...args)
    .catch(e => {
      expect(e.message).to.equal(error_message)
    })
}

describe("[ Messaging Helper | Subscribe Action ]", function(){

  describe('a correct call on subscribe', ()=>{

    let messagingAction, channel, callback;

    beforeEach(async()=>{

      callback = sinon.stub()

      messagingAction = new MessagingAction();

      messagingAction.settings = {
        connection: {
          host: "test_host",
          options: {
            user: "test_user",
            pass: "test_pass"
          }
        }
      }

      messagingAction.MessagingChannel = {};
      messagingAction.MessagingChannel.create = sinon.stub();

      channel = {};

      channel.assertExchange = sinon.stub();
      channel.publish = sinon.stub();
      channel.assertQueue = sinon.stub();
      channel.assertQueue.returns({queue: 'test_queue'})
      channel.bindQueue = sinon.stub();
      channel.consume = sinon.stub();
      
      channel.consume.callsFake((queue_name, callback)=>{
        callback({content: '"test_content"'})
      })

      messagingAction.MessagingChannel.create.returns(channel)

      await messagingAction.subscribe('test_exchange_name', callback)
    })

    it("should call MessagingChannel.create", ()=>{
      expect(messagingAction.MessagingChannel.create.calledOnce).to.true
      expect(messagingAction.MessagingChannel.create.firstCall.args[0]).to.equal('test_host')
      expect(messagingAction.MessagingChannel.create.firstCall.args[1]).to.equal('test_user')
      expect(messagingAction.MessagingChannel.create.firstCall.args[2]).to.equal('test_pass')
    })

    it("should call channel.assertExchange", ()=>{
      expect(channel.assertExchange.calledOnce).to.true
      expect(channel.assertExchange.firstCall.args[0]).to.equal('test_exchange_name')
      expect(channel.assertExchange.firstCall.args[1]).to.equal('fanout')
      expect(channel.assertExchange.firstCall.args[2].durable).to.equal(false)
    })

    it("should call channel.assertQueue", ()=>{
      expect(channel.assertQueue.calledOnce).to.true
      expect(channel.assertQueue.firstCall.args[0]).to.equal('')
      expect(channel.assertQueue.firstCall.args[1].exclusive).to.equal(true)
    })

    it("should call channel.bindQueue", ()=>{
      expect(channel.bindQueue.calledOnce).to.true
      expect(channel.bindQueue.firstCall.args[0]).to.equal('test_queue')
      expect(channel.bindQueue.firstCall.args[1]).to.equal('test_exchange_name')
      expect(channel.bindQueue.firstCall.args[2]).to.equal('')
    })

    it("should call channel.consume", ()=>{
      expect(channel.consume.calledOnce).to.true;
      expect(channel.consume.firstCall.args[0]).to.equal('test_queue')
      expect(callback.calledOnce).to.true
      expect(callback.firstCall.args[0]).to.equal('test_content')
      expect(channel.consume.firstCall.args[2].noAck).to.true
    })
    
  })

  describe('a fail call on subscribe', ()=>{

    let messagingAction;

    beforeEach(()=>{
      messagingAction = new MessagingAction()
    })

    it("should throw error if exchange_name is not defined", ()=>{
      return errorArgumentCallForPromise(messagingAction.subscribe, [undefined, 'test_callback'], 'exchange_name is not defined')
    })
    
    it("should throw error if exchange_message is not defined", ()=>{
      return errorArgumentCallForPromise(messagingAction.subscribe, ['test_exchange_name', undefined], 'callback is not defined')
    })

  });

});
