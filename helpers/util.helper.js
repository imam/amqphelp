export class MessagingUtil {

  // Depedency Injection:
  constructor({} = {}) {
    // a service for handling AMQP channel creation
  }

  sleep (time_sleep=10000, message){
    if ((process.env.NODE_ENV !== "test") && message) console.info(`${process.env.npm_package_name}: ${message} in ${time_sleep} ms`)
    return new Promise((resolve, reject)=>{
      try {
        setTimeout(function () {
          resolve();
        }, time_sleep);
      } catch (e) {
        throw e;
      }
    });
  }

};
