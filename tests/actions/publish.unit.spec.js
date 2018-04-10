'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_app() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_app() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_app() + "/channel.helper");

const sinon = require('sinon');

function errorArgumentCallForPromise(method, args, error_message) {
  return method(...args)
    .catch(e => {
      expect(e.message).to.equal(error_message)
    })
}

describe("[ Messaging Helper | Publish Action ]", function(){

  describe('a correct call on publish', ()=>{

    let messagingAction, channel;

    beforeEach(async()=>{
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

      messagingAction.MessagingChannel.create.returns(channel)

      await messagingAction.publish('test_exchange_name', 'test_exchange_message')
    })

    it("should call MessagingChannel.create", ()=>{
      expect(messagingAction.MessagingChannel.create.calledOnce).to.true
      expect(messagingAction.MessagingChannel.create.firstCall.args[0]).to.equal('test_host')
      expect(messagingAction.MessagingChannel.create.firstCall.args[1]).to.equal('test_user')
      expect(messagingAction.MessagingChannel.create.firstCall.args[2]).to.equal('test_pass')
    })

    it("should call channel.assertExchange", ()=>{
      expect(channel.assertExchange.calledOnce).to.true;
      expect(channel.assertExchange.firstCall.args[0]).to.equal('test_exchange_name')
      expect(channel.assertExchange.firstCall.args[1]).to.equal('fanout')
      expect(channel.assertExchange.firstCall.args[2].durable).to.equal(false)
    })

    it("should call channel.publish", ()=>{
      expect(channel.publish.calledOnce).to.true;
      expect(channel.publish.firstCall.args[0]).to.equal('test_exchange_name')
      expect(channel.publish.firstCall.args[1]).to.equal('')
      expect(channel.publish.firstCall.args[2].toString()).to.equal('"test_exchange_message"')
    })

    afterEach(()=>{
    })
  })

  describe('a fail call on publish', ()=>{

    let messagingAction;

    beforeEach(()=>{
      messagingAction = new MessagingAction()
    })

    it("should throw error if exchange_name is not defined", ()=>{
      return errorArgumentCallForPromise(messagingAction.publish, [undefined, 'test_exchange_message'], 'exchange_name is not defined')
    })
    
    it("should throw error if exchange_message is not defined", ()=>{
      return errorArgumentCallForPromise(messagingAction.publish, ['test_exchange_name', undefined], 'exchange_message is not defined')
    })

  });

});
