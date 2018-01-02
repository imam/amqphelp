
'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const { MessagingUtil } = require(pathfinder.to_messaging_helper() + "/util.helper");
const { MessagingChannel } = require(pathfinder.to_messaging_helper() + "/channel.helper");

let server  = require(pathfinder.to_app() + '/index');
let env  = require(pathfinder.to_env());

const amqpl = require('amqplib');
const sinon = require('sinon');

describe("[ Job Messaging Helper | Messaging Channel ]", function(){
  // let helper_actions = new MessagingChannel();
  let message_channel;
  let connection_stub, create_channel_stub;

  before(()=>{
    server.listen(3000);
  });

  describe('A correct call on create_channel', ()=>{

    const BROKER_USER = 'testing';
    const BROKER_PASS = 'testing';

    beforeEach(()=>{
      create_channel_stub = sinon.stub();
      create_channel_stub.returns({
        return: 1
      });

      const amqp_path = `amqp://${BROKER_USER}:${BROKER_PASS}@web_broker`;
      connection_stub = sinon.stub(amqpl, "connect");
      connection_stub.withArgs(amqp_path).returns({
        createChannel: create_channel_stub
      });

      let utils = new MessagingUtil();
      message_channel = new MessagingChannel({ utils, amqpl });
    });

    it('should call connect once', async ()=>{
      let channel = await message_channel.create(BROKER_USER, BROKER_PASS);
      expect(amqpl.connect.calledOnce).to.equal(true);
    });

    it('should call createChannel once', async ()=>{
      let channel = await message_channel.create(BROKER_USER, BROKER_PASS);
      expect(create_channel_stub.calledOnce).to.equal(true);
    });

    it('should return channel', async ()=>{
      let channel = await message_channel.create(BROKER_USER, BROKER_PASS);
      expect(channel.return).to.equal(1);
    });

    afterEach(()=>{
      amqpl.connect.restore();
    });

  });

  describe('A incorrect call on create_channel', ()=>{
    beforeEach(()=>{
      let utils = new MessagingUtil();
      message_channel = new MessagingChannel({ utils, amqpl });
    });

    it('should throw if no broker user or pass', async ()=>{
      try {
        let channel = await message_channel.create();
      } catch (e) {
        expect(e.message).to.equal("broker user and password is required!");
      }
    });
  });

  describe('A connection error to the broker', ()=>{

    const BROKER_USER = 'testing';
    const BROKER_PASS = 'testing';
    const RETRY_PERIOD = 1000;
    const NRETRY = 3;

    // let create_channel_spy;
    beforeEach(()=>{
      let utils = new MessagingUtil();
      message_channel = new MessagingChannel({ utils, amqpl });
    });

    it('should retry to connect again', async ()=>{
      try {
        let channel = await message_channel.create(BROKER_USER, BROKER_PASS, RETRY_PERIOD, NRETRY);
      } catch (e) {
        expect(message_channel.retry_time).to.equal(NRETRY);
      }
    });

  });

  after(()=>{
    server.close();
  });

});
