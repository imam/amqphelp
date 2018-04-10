//TODO:: Add deeper unit test on subscribe, publish and ping
export class MessagingAction {

  // Depedency Injection:
  constructor({ settings, utils, MessagingChannel, successful_rpc } = {}) {
    // a service for handling AMQP channel creation
    this.MessagingChannel = MessagingChannel;

    // configuration settings
    this.settings = settings;

    // messaging utilities function helper
    this.utils = utils || null;

    // other tracked parameters
    this.ping_count = 0;
    this.retry_rpc = 0;
    this.successful_rpc = successful_rpc || false;
    this.stringify_payload;
  }

  /**
   * async send - send simple payload to specify queue,
   *              used together with async RECEIVE
   * @param  {String} queue_name      queue name
   * @param  {Any} queue_message      the payload
   * @return {Promise}                promise of true
   */
  async send(queue_name, queue_message){

    if(queue_name === undefined || queue_message === undefined){
      throw new Error('Queue name and queue message is undefined')
    }

    let self = this;

    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    await channel.assertQueue(queue_name);

    let output = JSON.stringify(queue_message);

    let the_queue = await channel.sendToQueue(queue_name, new Buffer(output));

    await channel.close()
    
    if (process.env.NODE_ENV !== "test") console.log(`[o] Sent '${output}'`);

    return true;
  }

  /**
   * async receive - receive simple payload from the queue,
   *                 used together with async SEND
   * @param  {String} queue_name    queue name
   * @param  {Function} callback    callback function with params(payload)
   */
  async receive(queue_name, callback){

    if(!queue_name || !callback){
      throw new TypeError()
    }

    let self = this;

    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    await channel.assertQueue(queue_name);
    channel.consume(queue_name, function(msg) {
      if (msg !== null) {
        channel.ack(msg);
        callback(JSON.parse(msg.content.toString()));
      }
    });

  }

  /**
   * async create_task - request some task to be done, not waiting for the result,
   *                     but will try to recover task if worker failed to process the work,
   *                     used to together with create_task
   *
   * @param  {type} queue_name=null description
   * @param  {type} payload=null    description
   * @param  {type} durable=true    description
   * @param  {type} persistent=true description
   * @return {type}                 description
   */
  async create_task(queue_name=null, payload=null, durable=true, persistent=true){

    if(queue_name===null || payload===null){
      throw new Error('Queue name and payload is required, as first and second params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    await channel.assertQueue(queue_name, {durable: durable});

    this.stringify_payload = JSON.stringify(payload);

    let the_queue = channel.sendToQueue(queue_name, new Buffer(this.stringify_payload), {persistent: persistent});
  }

  /**  
   * async queue_worker - setup service worker for processing some task,
   *                      used to together with create_task
   *
   * @param  {type} queue_name=null description
   * @param  {type} prefetch=3      description
   * @param  {type} durable=true    description
   * @return {type}                 description
   */
  async queue_worker(queue_name=null, prefetch=3, durable=true){

    if(queue_name===null){
      throw new Error('Queue name is required, as the first params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    await channel.assertQueue(queue_name, {durable: durable});

    channel.prefetch(prefetch);

    channel.consume(queue_name, function(msg) {
      if (msg !== null) {
        // events[queue_name](msg.content);
        ch.ack(msg);
      }
    }, {noAck: false});
  }


  /**
   * async rpc_client - request some task to be done from rpc_server and wait for the result,
   *                    used together with rpc_server
   *
   * @param  {String} queue_name=null           description
   * @param  {Any} payload=null                 description
   * @param  {String} correlationId=null        description
   * @param  {Function} callback=null  description
   */
  async rpc_client(queue_name=null, payload=null, correlationId=null, callback=null){

    if(queue_name===null || payload===null){
      throw new Error('Queue name and payload is required, as first and second params');
    }

    if(correlationId===null || callback===null){
      throw new Error('correlationId and callback is required, as third and fourth params');
    }

    let self = this;

    let channel = await self.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    let q = await channel.assertQueue('', {exclusive: true});

    channel.consume(q.queue, async function(msg) {
      if (msg.properties.correlationId === correlationId) {
        await callback(msg, channel);
        self.successful_rpc = true;
      }
    }, {noAck: true});

    self.stringify_payload = JSON.stringify(payload);

    let the_queue = channel.sendToQueue(queue_name, new Buffer(self.stringify_payload),
                                                    { correlationId: correlationId, replyTo: q.queue });

  }

  /**
   * async rpc_server - setup service service server for processing some task then give response immediately after finished,
   *                    used together with rpc_client
   *
   * @param  {type} queue_name=null description
   * @param  {type} activity=null   description
   * @param  {type} prefetch=3      description
   * @return {type}                 description
   */
  async rpc_server(queue_name=null, activity=null, prefetch=3){
    if(queue_name===null || activity===null){
      throw new Error('Queue name and activity is required, as the first and second params');
    }

    let self = this;
    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    await channel.assertQueue(queue_name, {durable: false});

    channel.prefetch(prefetch);

    channel.consume(queue_name, async function reply(msg) {
      await activity(msg, channel);
    });

  }

  async publish(exchange_name, exchange_message){

    if(!exchange_name){
      throw new Error('exchange_name is not defined')
    }

    if(!exchange_message){
      throw new Error('exchange_message is not defined')
    }

    let self = this;

    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    channel.assertExchange(exchange_name, 'fanout', {durable: false});

    let output = JSON.stringify(exchange_message);

    channel.publish(exchange_name, '', new Buffer(output));

    if(process.env == "test"){
      console.log(`[o] sent '${output}'`)
    }

    return true;
  }

  async subscribe(exchange_name, callback){

    if(!exchange_name){
      throw new Error("exchange_name is not defined")
    }

    if(!callback){
      throw new Error("callback is not defined")
    }

    let self = this;

    let channel = await this.MessagingChannel.create(
      this.settings.connection.host,
      this.settings.connection.options.user,
      this.settings.connection.options.pass
    );

    channel.assertExchange(exchange_name, 'fanout', {durable: false}) 

    let queue_name = await channel.assertQueue('', {exclusive: true})

    await channel.bindQueue(queue_name.queue, exchange_name, '')

    channel.consume(queue_name.queue, msg=>{
      callback(JSON.parse(msg.content.toString()))
    }, {noAck: true})
  }

  async ping(ping_interval = 3000){
    let self = this;

    let queue_name = `${process.env.npm_package_name}_heartbeat`

    let interval = await setInterval(async ()=>{

      self.ping_count++;

      await this.publish(`${process.env.npm_package_name}_heartbeat`, 'beat')

    }, ping_interval)

    return interval;
  }

};
