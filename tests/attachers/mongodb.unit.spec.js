'use strict';

const pathfinder = require(process.env.PWD + '/pathfinder');
const expect = require('chai').expect;
const sinon = require('sinon');
const mongodbattacher = require(pathfinder.to_attachers() + '/mongodb')
const _ = require('lodash')

describe("[ Messaging Helper | Mongodb Attachers]", ()=>{

    let attacher_object;

    beforeEach(()=>{
        attacher_object = new mongodbattacher();
    })
    
    describe("A call on create, update, delete", ()=>{
        let amqp_send_stub, _attach_to_amqp_stub, args_spread, amqp;
        
        beforeEach(()=>{
            _attach_to_amqp_stub = sinon.stub(attacher_object, '_attachToAmqp');
            
            amqp_send_stub = sinon.stub()
            
            amqp = {
                actions: {
                    send: amqp_send_stub
                }
            }
            
            args_spread = [
                'test_queue_name',
                'schema_name',
                'current_service_name',
                'service_to_name',
                'schema',
                amqp,
                'options',
            ]
            
            attacher_object.create(...args_spread)
            attacher_object.update(...args_spread)
            attacher_object.delete(...args_spread)
        })
        
        describe("A success call on create", ()=>{
            it("should call call _attachToAmqp with the right argument", ()=>{
                let args_compare = _(args_spread).push('save').value()
                expect(_.isEqual(_attach_to_amqp_stub.firstCall.args, args_compare)).to.equal(true)
            })
        })
        
        describe("A success call on update", ()=>{
            it("should call call _attachToAmqp with the right argument", ()=>{
                let args_compare = _(args_spread).push('update').value()
                expect(_.isEqual(_attach_to_amqp_stub.secondCall.args, args_compare)).to.equal(true)
            })
        })
        
        describe("A success call on delete", ()=>{
            it("should call call _attachToAmqp with the right argument", ()=>{
                let args_compare = _(args_spread).push('remove').value()
                expect(_.isEqual(_attach_to_amqp_stub.thirdCall.args, args_compare)).to.equal(true)
            })
        })
    })

    describe("A call on _sendToAmqp", ()=>{
        it("should call send action", ()=>{
            let amqp_actions_send_stub = sinon.stub();

            let amqp = {
                actions: {
                    send: amqp_actions_send_stub
                }
            }

            attacher_object._sendToAmqp(amqp, 'test_queue_name', 'test_doc');

            expect(amqp_actions_send_stub.firstCall.args[0]).to.equal('test_queue_name')
            expect(amqp_actions_send_stub.firstCall.args[1]).to.equal('test_doc')
        })
    })

    describe("A call on _attachToAmqp", ()=>{

        let schema_post, schema, _populator_stub, _send_to_amqp_stub, _depopulator_stub, next_stub;

        beforeEach(async ()=>{
            schema_post = sinon.stub();

            next_stub = sinon.stub();

            schema_post.callsFake((method, callback)=>{
                callback('test_doc', next_stub);
            })

            _populator_stub = sinon.stub(attacher_object, '_populator')
            _send_to_amqp_stub = sinon.stub(attacher_object, '_sendToAmqp')
            _depopulator_stub = sinon.stub(attacher_object, '_depopulator')

            schema = {
                post: schema_post
            }

            await attacher_object._attachToAmqp('test_queue_name', 'test_schema_name', 'test_current_service', 'test_service_to', schema, 'test_amqp', 'test_options', 'test_method')
        })

        it("should call post", async ()=>{
            expect(schema_post.calledOnce).to.true
            expect(schema_post.firstCall.args[0]).to.equal('test_method')
        })

        it("should call _populator in _attachToAmqp callback", ()=>{
            expect(_populator_stub.calledOnce).to.true
            expect(_populator_stub.firstCall.args[0]).to.equal('test_doc')
            expect(_populator_stub.firstCall.args[1]).to.equal('test_options')
            expect(_populator_stub.firstCall.args[2]).to.equal('test_service_to')
        })

        it("should call _sendToAmqp in _attachToAmqp callback", ()=>{
            expect(_send_to_amqp_stub.calledOnce).to.true
            expect(_send_to_amqp_stub.firstCall.args[0]).to.equal('test_amqp')
            expect(_send_to_amqp_stub.firstCall.args[1]).to.equal('test_queue_name')
            expect(_send_to_amqp_stub.firstCall.args[2]).to.equal('test_doc')
        })

        it("should call _depopulator in _attachToAmqp callback", ()=>{
            expect(_depopulator_stub.calledOnce).to.true
            expect(_depopulator_stub.firstCall.args[0]).to.equal('test_doc')
            expect(_depopulator_stub.firstCall.args[1]).to.equal('test_options')
            expect(_depopulator_stub.firstCall.args[2]).to.equal('test_service_to')
        })

        it("should call next in _attachToAmqp callback", ()=>{
            expect(next_stub.calledOnce).to.true;
        })
    })

    describe("A call on _populator", ()=>{

        let each_stub, _get_current_service_to_options_stub, doc_populate_stub, doc_exec_populate_stub;

        beforeEach(()=>{
            _get_current_service_to_options_stub = sinon.stub(attacher_object, '_getCurrentServiceToOptions')
            _get_current_service_to_options_stub.returns({populate: 'test_populate'})

            each_stub = sinon.stub(_, 'each')
            each_stub.callsFake((populate, callback)=>{
                callback('test_value');
            })

            doc_populate_stub = sinon.stub()

            doc_exec_populate_stub = sinon.stub()

            attacher_object._populator({populate: doc_populate_stub, execPopulate: doc_exec_populate_stub} ,'test_options', 'test_service_to');
        })

        it("should call _getCurrentServiceToOptions", ()=>{
            expect(_get_current_service_to_options_stub.calledOnce).to.true
            expect(_get_current_service_to_options_stub.firstCall.args[0]).to.equal('test_options')
            expect(_get_current_service_to_options_stub.firstCall.args[1]).to.equal('test_service_to')
        })

        it("should call each", ()=>{
            expect(each_stub.calledOnce).to.true
            expect(each_stub.firstCall.args[0]).to.equal('test_populate')
        })

        it("should call doc.populate in each", ()=>{
            expect(doc_populate_stub.calledOnce).to.true
            expect(doc_populate_stub.firstCall.args[0]).to.equal('test_value')
        })

        it("should call doc.execPopulate", ()=>{
            expect(doc_populate_stub.calledOnce).to.true
        })

        afterEach(()=>{
            each_stub.restore()
        })
    })

    describe("A call on _depopulator", ()=>{

        let _get_current_service_to_options_stub, doc_depopulate_stub;

        beforeEach(()=>{
            _get_current_service_to_options_stub = sinon.stub(attacher_object, '_getCurrentServiceToOptions');

            _get_current_service_to_options_stub.returns({populate: ['test_populate']})

            let doc = { depopulate(){}}
            doc_depopulate_stub = sinon.stub(doc, 'depopulate');

            attacher_object._depopulator(doc, 'test_options', 'test_service_to')
        })

        it("should call _getCurrentServiceToOptions", ()=>{
            expect(_get_current_service_to_options_stub.calledOnce).to.true
            expect(_get_current_service_to_options_stub.firstCall.args[0]).to.equal('test_options')
        })

        it("should call depopulate", ()=>{
            expect(doc_depopulate_stub.calledOnce).to.true
            expect(doc_depopulate_stub.firstCall.args[0]).to.equal('test_populate')
        })
    })

    describe("A call on _getCurrentServiceToOptions", ()=>{
        it("should return correct data", ()=>{
            let to_validate = attacher_object._getCurrentServiceToOptions(['test_should_not_included', {name: 'test_service_to', populate: ['halo']}], 'test_service_to');

            expect(to_validate['name']).to.equal('test_service_to')
            expect(to_validate['populate'][0]).equal('halo')
        })
    })
});
