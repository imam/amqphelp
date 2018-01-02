'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_messaging_helper() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_messaging_helper() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_messaging_helper() + "/channel.helper");

let server  = require(pathfinder.to_app() + '/index');
let env  = require(pathfinder.to_env());

const sinon = require('sinon');

describe("[ Job Messaging Helper | Queue Worker Action ]", function(){
  before(()=>{
    server.listen(3000);
  });

  describe('a correct call on queue_worker', ()=>{
    const BROKER_USER = process.env.WEB_BROKER_DEFAULT_USER;
    const BROKER_PASS = process.env.WEB_BROKER_DEFAULT_PASS;

    let messagingChannel, messagingAction;

    let channel_stub;

    const QUEUE_NAME = 'testing_queue';
    const MESSAGE = 'testing_queue';

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = sinon.stub({
        assertQueue: () => { return Promise.resolve(true) },
        prefetch: () => { return true },
        consume: () => { return 1 }
      });

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });
    });

    it('should call assertQueue once', async function(){
      await messagingAction.queue_worker(QUEUE_NAME, MESSAGE);
      expect(channel_stub.assertQueue.calledOnce).to.equal(true);
    });

    it('should call prefetch once', async function(){
      await messagingAction.queue_worker(QUEUE_NAME, MESSAGE);
      expect(channel_stub.prefetch.calledOnce).to.equal(true);
    });

    it('should call assertQueue before consume', async function(){
      await messagingAction.queue_worker(QUEUE_NAME, MESSAGE);
      expect(channel_stub.assertQueue.calledBefore(channel_stub.consume)).to.equal(true);
    });

    afterEach(()=>{
      messagingChannel.create.restore();
    });

  });

  describe('a incorrect call on create_task', ()=>{

    const BROKER_USER = process.env.WEB_BROKER_DEFAULT_USER;
    const BROKER_PASS = process.env.WEB_BROKER_DEFAULT_PASS;

    let messagingChannel, messagingAction;

    let channel_stub;

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = sinon.stub({
        assertQueue: () => { return Promise.resolve(true) },
        prefetch: () => { return true },
        consume: () => { return 1 }
      });

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });
    });

    it('should throw error if no queue name or message params provided', async function(){
      try {
        await messagingAction.queue_worker();
      } catch (e) {
        expect(e.message).to.equal("Queue name is required, as the first params");
      }
    });

    afterEach(()=>{
      messagingChannel.create.restore();
    });

  });

  after(()=>{
    server.close();
  });
});
