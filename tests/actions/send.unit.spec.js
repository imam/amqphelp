'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const chai = require('chai');
const expect = chai.expect;
const { MessagingAction } = require(pathfinder.to_app() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_app() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_app() + "/channel.helper");

const sinon = require('sinon');

describe("[ Messaging Helper | Send Action ]", function(){

  describe('a correct call on send', ()=>{

    const BROKER_HOST = 'localhost';
    const BROKER_USER = 'guest';
    const BROKER_PASS = 'guest';

    let messagingChannel, messagingAction;
    let channel_stub;

    const QUEUE_NAME = 'testing_queue';
    const MESSAGE = 'testing_queue';

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});
      messagingAction = new MessagingAction();

      channel_stub = sinon.stub({
        assertQueue: () => { return Promise.resolve(true) },
        sendToQueue: () => { return 1 }
      });

      let settings = {
        connection: {
          host: BROKER_HOST,
          options: {
            user: BROKER_USER,
            pass: BROKER_PASS
          }
        }
      }

      let send_channel_stub = sinon.stub(messagingChannel, "create");
      send_channel_stub.withArgs(BROKER_HOST, BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ settings:settings, MessagingChannel: messagingChannel });
    });

    it('should call assertQueue once', async ()=>{
      await messagingAction.send(QUEUE_NAME, MESSAGE)
      expect(channel_stub.assertQueue.calledOnce).to.equal(true);
    });

    it('should call sendToQueue once', async function(){
      await messagingAction.send(QUEUE_NAME, MESSAGE);
      expect(channel_stub.sendToQueue.calledOnce).to.equal(true);
    });

    it('should call assertQueue before sendToQueue', async function(){
      await messagingAction.send(QUEUE_NAME, MESSAGE);
      expect(channel_stub.assertQueue.calledBefore(channel_stub.sendToQueue)).to.equal(true);
    });

    afterEach(()=>{
      messagingChannel.create.restore();
    });

  });

  describe('an error call on send', ()=>{
    const BROKER_HOST = 'localhost';
    const BROKER_USER = 'guest';
    const BROKER_PASS = 'guest';

    let messagingChannel, messagingAction;
    let channel_stub;

    const QUEUE_NAME = 'testing_queue';
    const MESSAGE = 'testing_queue';

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});
      messagingAction = new MessagingAction();

      channel_stub = sinon.stub({
        assertQueue: () => { return Promise.resolve(true) },
        sendToQueue: () => { return 1 }
      });

      let settings = {
        connection: {
          host: BROKER_HOST,
          options: {
            user: BROKER_USER,
            pass: BROKER_PASS
          }
        }
      }

      let send_channel_stub = sinon.stub(messagingChannel, "create");
      send_channel_stub.withArgs(BROKER_HOST, BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ settings:settings, MessagingChannel: messagingChannel });
    });

    it("should throw error if queue_name and queue_message is undefined", async ()=>{
      try{
        await messagingAction.send(undefined, undefined)
        throw new Error('Error should be thrown')
      } catch(e){
        let test = expect(e.message).to.equal('Queue name and queue message is undefined')
      }
    })

    afterEach(()=>{
      messagingChannel.create.restore();
    });
  })

});
