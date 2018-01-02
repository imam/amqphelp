'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_app() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_app() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_app() + "/channel.helper");

let server  = require(pathfinder.to_app() + '/index');
let env  = require(pathfinder.to_env());

const sinon = require('sinon');

describe("[ Job Messaging Helper | Create Task Action ]", function(){
  before(()=>{
    server.listen(3000);
  });

  describe('a correct call on create_task', ()=>{
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
        sendToQueue: () => { return 1 }
      });

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });
    });

    it('should call assertQueue once', async function(){
      await messagingAction.create_task(QUEUE_NAME, MESSAGE);
      expect(channel_stub.assertQueue.calledOnce).to.equal(true);
    });

    it('should call sendToQueue once', async function(){
      await messagingAction.create_task(QUEUE_NAME, MESSAGE);
      expect(channel_stub.sendToQueue.calledOnce).to.equal(true);
    });

    it('should call assertQueue before sendToQueue', async function(){
      await messagingAction.create_task(QUEUE_NAME, MESSAGE);
      expect(channel_stub.assertQueue.calledBefore(channel_stub.sendToQueue)).to.equal(true);
    });

    it('should stringify message before sending to queue, test with string message', async function(){
      await messagingAction.create_task(QUEUE_NAME, MESSAGE);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with object message', async function(){
      await messagingAction.create_task(QUEUE_NAME, {object: 'message'});
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with number message', async function(){
      await messagingAction.create_task(QUEUE_NAME, 10);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with boolean message', async function(){
      await messagingAction.create_task(QUEUE_NAME, false);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
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
        sendToQueue: () => { return 1 }
      });

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });
    });

    it('should throw error if no queue name or payload params provided', async function(){
      try {
        await messagingAction.create_task();
      } catch (e) {
        expect(e.message).to.equal("Queue name and payload is required, as first and second params");
      }
    });

    it('should throw error if no payload params provided', async function(){
      try {
        await messagingAction.create_task('queue_test_name');
      } catch (e) {
        expect(e.message).to.equal("Queue name and payload is required, as first and second params");
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
