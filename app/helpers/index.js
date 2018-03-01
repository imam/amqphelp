import Amqp from './base';
import MongoDBAttacher from '../../attachers/mongodb.js'

module.exports = (settings) => {
  const amqp = new Amqp({settings})

  amqp.registerAttacher('mongo', new MongoDBAttacher)

  return amqp
};
