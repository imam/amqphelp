'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingAction } = require(pathfinder.to_messaging_helper() + "/action.helper");
const { MessagingUtil } = require(pathfinder.to_messaging_helper() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_messaging_helper() + "/channel.helper");

let server  = require(pathfinder.to_app() + '/index');
let env  = require(pathfinder.to_env());

const sinon = require('sinon');

describe("[ Job Messaging Helper | RPC Client Action ]", function(){
  before(()=>{
    server.listen(3000);
  });

  describe('a correct call on rpc_client', ()=>{
    const BROKER_USER = process.env.WEB_BROKER_DEFAULT_USER;
    const BROKER_PASS = process.env.WEB_BROKER_DEFAULT_PASS;

    let messagingChannel, messagingAction;

    let channel_stub, activity_stub;

    const QUEUE_NAME = 'testing_queue';
    const MESSAGE = 'testing_queue';
    const CORRELATION_ID = "11111111";

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({ utils: utils });

      channel_stub = sinon.stub({
        assertQueue: () => { return true },
        consume: () => { return true },
        sendToQueue: () => { return 1 }
      });

      channel_stub.assertQueue.returns(Promise.resolve({
        queue: 'random.queue.name',
        messageCount: 0,
        consumerCount: 0
      }));

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);
      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel, successful_rpc: true });

      activity_stub = sinon.stub({});
    });

    it('should call assertQueue once', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.assertQueue.calledOnce).to.equal(true);
    });

    it('should call sendToQueue once', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.sendToQueue.calledOnce).to.equal(true);
    });

    it('should call consume once', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.consume.calledOnce).to.equal(true);
    });

    it('should call assertQueue before sendToQueue', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.assertQueue.calledBefore(channel_stub.sendToQueue)).to.equal(true);
    });

    it('should call assertQueue before consume', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.assertQueue.calledBefore(channel_stub.consume)).to.equal(true);
    });

    it('should call consume before sendToQueue', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(channel_stub.consume.calledBefore(channel_stub.sendToQueue)).to.equal(true);
    });

    it('should stringify message before sending to queue, test with string message', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, MESSAGE, CORRELATION_ID, activity_stub);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with object message', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, {object: 'message'}, CORRELATION_ID, activity_stub);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with number message', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, 10, CORRELATION_ID, activity_stub);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    it('should stringify message before sending to queue, test with boolean message', async function(){
      await messagingAction.rpc_client(QUEUE_NAME, false, CORRELATION_ID, activity_stub);
      expect(typeof messagingAction.stringify_payload).to.equal('string');
    });

    afterEach(()=>{
      messagingChannel.create.restore();
    });

  });

  describe('a incorrect call on rpc_client', ()=>{

    const BROKER_USER = process.env.WEB_BROKER_DEFAULT_USER;
    const BROKER_PASS = process.env.WEB_BROKER_DEFAULT_PASS;

    let messagingChannel, messagingAction;

    let channel_stub;

    beforeEach(async ()=>{
      let utils = new MessagingUtil();
      messagingChannel = new MessagingChannel({utils});

      channel_stub = sinon.stub({
        assertQueue: () => { return true },
        consume: () => { return true },
        sendToQueue: () => { return 1 }
      });

      channel_stub.assertQueue.returns(Promise.resolve({
        queue: 'random.queue.name',
        messageCount: 0,
        consumerCount: 0
      }));

      let create_channel_stub = sinon.stub(messagingChannel, "create");
      create_channel_stub.withArgs(BROKER_USER, BROKER_PASS).returns(channel_stub);

      messagingAction = new MessagingAction({ MessagingChannel: messagingChannel });
    });

    it('should throw error if no queue name or payload params provided', async function(){
      try {
        await messagingAction.rpc_client();
      } catch (e) {
        expect(e.message).to.equal("Queue name and payload is required, as first and second params");
      }
    });

    it('should throw error if no payload params provided', async function(){
      try {
        await messagingAction.rpc_client('queue_test_name');
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
