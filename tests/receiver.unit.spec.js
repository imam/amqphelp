'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const receiver = require(pathfinder.to_app() + '/receiver')

describe("[ Messaging Helper | Receiver ] ", ()=>{
    
    //TODO::Unit test register()

    describe("a success call on _init", ()=>{

        let receiver_object, create_stub, update_stub, delete_stub;

        beforeEach(()=>{
            receiver_object = new receiver();
            receiver_object.create = sinon.spy()
            receiver_object.update = sinon.spy()
            receiver_object.delete = sinon.spy()

            receiver_object._init('test_amqp');
        })

        it("should call create", ()=>{
            expect(receiver_object.create.calledOnce).to.equal(true)
        })

        it("should call update", ()=>{
            expect(receiver_object.update.calledOnce).to.equal(true)
        })

        it("should call delete", ()=>{
            expect(receiver_object.delete.calledOnce).to.equal(true)
        })

    })

    describe("a fail call on _init", ()=>{
        it('should throw if ampq is not defined', ()=>{
            let receiver_object = new receiver();
            expect(()=>{receiver_object._init( undefined )}).to.throw('amqp is not defined')
        })
    })

    describe("a success call on create", ()=>{
        it("should call receive create once", ()=>{
            let receiver_object = new receiver();

            receiver_object.receiveCreate = sinon.spy()

            receiver_object.create();

            expect(receiver_object.receiveCreate.calledOnce).to.equal(true)
        })
    })

    describe("a success call on update", ()=>{
        it("should call receive update once", ()=>{
            let receiver_object = new receiver();

            receiver_object.receiveUpdate = sinon.spy()

            receiver_object.update();

            expect(receiver_object.receiveUpdate.calledOnce).to.equal(true)
        })
    })

    describe("a success call on delete", ()=>{
        it("should call receive delete once", ()=>{
            let receiver_object = new receiver();

            receiver_object.receiveDelete = sinon.spy()

            receiver_object.delete();

            expect(receiver_object.receiveDelete.calledOnce).to.equal(true)
        })
    })

    describe("a success call on receive create", ()=>{

        let receiver_object, amqp_receive, callback_spy;

        beforeEach(()=>{
            receiver_object = new receiver();

            receiver_object.service_name = "test";
            receiver_object.receive_from = "test_from";
            receiver_object.payload_name = "test_payload"

            amqp_receive = sinon.spy();

            receiver_object.amqp = {
                actions: {
                    receive: amqp_receive
                }
            }
            callback_spy = sinon.spy

            receiver_object.receiveCreate(callback_spy);
        })

        it("should call receive with right arguments", ()=>{
            expect(amqp_receive.firstCall.args[0]).to.equal('create_test_payload_from_test_from_for_test')
            expect(amqp_receive.firstCall.args[1]).to.equal(callback_spy)
        })
    })

    describe("a success call on receive update", ()=>{

        let receiver_object, amqp_receive, callback_spy;

        beforeEach(()=>{
            receiver_object = new receiver();

            receiver_object.service_name = "test";
            receiver_object.receive_from = "test_from";
            receiver_object.payload_name = "test_payload"

            amqp_receive = sinon.spy();

            receiver_object.amqp = {
                actions: {
                    receive: amqp_receive
                }
            }
            callback_spy = sinon.spy

            receiver_object.receiveUpdate(callback_spy);
        })

        it("should call receive with right arguments", ()=>{
            expect(amqp_receive.firstCall.args[0]).to.equal('update_test_payload_from_test_from_for_test')
            expect(amqp_receive.firstCall.args[1]).to.equal(callback_spy)
        })
    })

    describe("a success call on receive delete", ()=>{

        let receiver_object, amqp_receive, callback_spy;

        beforeEach(()=>{
            receiver_object = new receiver();

            receiver_object.service_name = "test";
            receiver_object.receive_from = "test_from";
            receiver_object.payload_name = "test_payload"

            amqp_receive = sinon.spy();

            receiver_object.amqp = {
                actions: {
                    receive: amqp_receive
                }
            }
            callback_spy = sinon.spy

            receiver_object.receiveDelete(callback_spy);
        })

        it("should call receive with right arguments", ()=>{
            expect(amqp_receive.firstCall.args[0]).to.equal('delete_test_payload_from_test_from_for_test')
            expect(amqp_receive.firstCall.args[1]).to.equal(callback_spy)
        })
    })

})
