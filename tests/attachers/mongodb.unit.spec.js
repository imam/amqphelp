'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const mongodbattacher = require(pathfinder.to_attachers() + '/mongodb')

describe("[ Messaging Helper | Mongodb Attachers]", ()=>{
    describe("A success call on create", ()=>{
        let schema_pre_stub, amqp_send_stub, console_log_stub, next_stub;

        beforeEach(()=>{
            next_stub = sinon.spy();

            schema_pre_stub = sinon.stub().callsFake((event, callback)=>{
                callback(next_stub);
            })

            let schema = {
                pre: schema_pre_stub
            }

            let attacher_object = new mongodbattacher()

            amqp_send_stub = sinon.stub()

            let amqp = {
                actions: {
                    send: amqp_send_stub
                }
            }

            attacher_object.create('test_queue_name', schema, amqp)
        })

        it("should call first argument correctly", ()=>{
            expect(schema_pre_stub.firstCall.args[0]).to.equal('save')
        })

        it("should call amqp send action correctly", ()=>{
            expect(amqp_send_stub.firstCall.args[0]).to.equal('test_queue_name')
        })

        it("should call next once", ()=>{
            expect(next_stub.calledOnce).to.equal(true)
        })

        //TODO:: Error call
    })

    describe("A success call on update", ()=>{
        let schema_pre_stub, amqp_send_stub, console_log_stub, next_stub;

        beforeEach(()=>{
            next_stub = sinon.spy();

            schema_pre_stub = sinon.stub().callsFake((event, callback)=>{
                callback(next_stub);
            })

            let schema = {
                post: schema_pre_stub
            }

            let attacher_object = new mongodbattacher()

            attacher_object._conditions = {
                _id : 'object_id'
            }
            attacher_object._update = 'update_value'

            amqp_send_stub = sinon.stub()

            let amqp = {
                actions: {
                    send: amqp_send_stub
                }
            }

            attacher_object.update('test_queue_name', schema, amqp)
        })

        it("should call first argument correctly", ()=>{
            expect(schema_pre_stub.firstCall.args[0]).to.equal('update')
        })

        it("should call amqp send action correctly", ()=>{
            expect(amqp_send_stub.firstCall.args[0]).to.equal('test_queue_name')
            expect(amqp_send_stub.firstCall.args[1].id).to.equal('object_id')
            expect(amqp_send_stub.firstCall.args[1].update).to.equal('update_value')
        })

        it("should call next once", ()=>{
            expect(next_stub.calledOnce).to.equal(true)
        })

        //TODO:: Error call
    })


    describe("A success call on delete", ()=>{
        let schema_pre_stub, amqp_send_stub, console_log_stub, next_stub;

        beforeEach(()=>{
            next_stub = sinon.spy();

            schema_pre_stub = sinon.stub().callsFake((event, callback)=>{
                callback(next_stub);
            })

            let schema = {
                post: schema_pre_stub
            }

            let attacher_object = new mongodbattacher()

            attacher_object._conditions = {
                _id : 'a'
            }
            attacher_object._update = 'a'

            amqp_send_stub = sinon.stub()

            let amqp = {
                actions: {
                    send: amqp_send_stub
                }
            }

            attacher_object.delete('test_queue_name', schema, amqp)
        })

        it("should call first argument correctly", ()=>{
            expect(schema_pre_stub.firstCall.args[0]).to.equal('remove')
        })

        it("should call amqp send action correctly", ()=>{
            expect(amqp_send_stub.firstCall.args[0]).to.equal('test_queue_name')
        })

        it("should call next once", ()=>{
            expect(next_stub.calledOnce).to.equal(true)
        })

        //TODO:: Error call
    })
});
