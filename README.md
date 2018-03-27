# amqphelp

-----

(Currently) only can be use for Sribu and Sribulancer, might not be a package that you hope for :(

-----

To run simulation, do : `npm run simulate -- ./simulation/files_to_be_simulated`

-----

# Ask-Answer

To ease back-and-forth communication between two entities, you can use `ask` and `answer` functionality.

## Ask

If an entity need to 'ask' other entity to do/give something, you can use `ask` like this:

```javascript

amqphelp.ask(entityToAsk, action, payload)

```

It will return a promise that will resolved after the entity that you asked responded to your 'ask'.

## Answer

On the other end, the entity that being asked should answer. `answer` can be used like this:

```javascript

amqphelp.answer(entityToAsk, callback)

```

In the callback we will give the payload that were given by the answer and you can give any values to the asker by returning anything in the callback.

```javascript

amqphelp.answer(entityToAsk, payload => {
    let payload_to_give_to_the_asker = anyfunction(payload);
    
    return payload_to_give_to_the_asker;
}

```

# Model

We use an opiniated modeling system to ease the development when you want to connect to any database system and monitor any changes (create, update, delete) that they've been made and notify RabbitMq.

## Service Name
Service name is an identifier in our modeling system. We use your package name in your `package.json` (`process.env.npm_package_name`) as `service_name` by default, but you can fire `registerServiceName(service_name)` if you want to change it.

//TODO:: Write about attacher, and custom attacher

## Attacher

### MongoDB

To use MongoDB with amqphelp, is as simple as:

```javascript
amqphelp.model('mongo', payload_name, modelSchema, entitiesToSendTo)
```

For example, I want to send any changes that a mongodb model named `employee` made to an entity named `boss`. We can do

```javascript
amqphelp.model('mongo', 'employee', modelSchema, ['boss'])
```

If my `service_name` is `office`, then every time `employee` changed, it will push these queues to RabbitMq:

`create_employee_from_office_for_boss`
`update_employee_from_office_for_boss`
`delete_employee_from_office_for_boss`

You can receive these with default `receive` method from `amqphelp`, but we made `receiver` class for more convenience use of this feature.

#### Populate

If you want to populate a document before sending it to RabbitMq, you can send an object contains `name` for entity to send's name and `populate` for the field that you want to be populated.

`amqphelp.model('mongo', 'employee', modelSchema, [{name: 'boss', populate: ['companies']})]`

`Populate` should be an array of `path`.

## Receiving from model

To receive queues from a model, just extend `amqphelp/app/helpers/receiver.js` like this to the receiver entity.

```Javascript
class BossReceiver extends AmqpReceiver {
}
```

Then, attach that `receiver` class to your `amqphelp` entity.

```Javascript
amqphelp.modelReceive(new BossReceiver)
```

### Settings
There are several settings that are required to register:
- `receive_from`, the name of entity that you receive the payload from
- `payload_name`, the name of payload that you'll be receiving
- `service_name`, the name of the current entity (default to your package name in your `package.json`)

You should register them in `register` method

```Javascript
class BossReceiver extends AmqpReceiver {

    register(){
        this.service_name = 'boss'
        this.receive_from = 'office';
        this.payload_name = 'employee';
    }

}
```

### Managing payload

By default, when you're receiving any queues from model, we'll log the payload to console, and acknowledge that we've received the queue to RabbitMq. If you want to use the payload, you should add some/all of these methods according to your need: `create`, `update`, and `delete`, then call `receiveCreate(callback)`, `receiveUpdate(callback)`, or `receiveDelete(callback)`. 

Callback given to `receive{Create|Update|Delete}` would contain a payload as their first argument.

```Javascript

class BossReceiver extends AmqpReceiver{

    create(){
        this.receiveCreate(payload=>{
            //Things to do with the payload
        })
    }
    
    update(){
        this.receiveUpdate(payload=>{
            //Things to do with the payload
        })
    }

    delete(){
        this.receiveDelete(payload=>{
            //Things to do with the payload
        })
    }

}
```
