import { mongo } from 'mongoose';

const amqphelp = require('./bootstrap.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost:27020/testamq')

const testRelationSchema = new Schema({
    title: String
})

const TestRelation = mongoose.model('TestRelation', testRelationSchema)

const testRelation2Schema = new Schema({
    title: String
})

const TestRelation2 = mongoose.model('TestRelation2', testRelation2Schema)

const testSchema = new Schema({
    title: String,
    test_relation_id: {type: Schema.Types.ObjectId, ref: "TestRelation"},
    test_relation_2_id: {type: Schema.Types.ObjectId, ref: "TestRelation2"}
})

amqphelp.model(
    'mongo', 
    'test', 
    testSchema, 
    ['jobs', 'chat' , {name: 'category', populate: ['test_relation_id']}, {name: 'halo', populate: ['test_relation_2_id']}]);

const Test = mongoose.model('Test', testSchema)

const dataRelation = new TestRelation({title: "hehehe"})
const dataRelation2 = new TestRelation2({title: "hehehe"})

async function dataTest(){
    await dataRelation.save();
    await dataRelation2.save();

    const data = new Test({title: 'Halooo', test_relation_id: dataRelation._id, test_relation_2_id: dataRelation2._id})

    await data.save();

    await data.remove();
    let populated = await data.populate('test_relation_id').execPopulate()

    console.log(populated)

    dataRelation.remove();

}

dataTest();
