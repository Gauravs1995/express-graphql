import Event from '../models/event.model';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

const findEventsCreated = eventIds => {
  return Event.find({ _id: { $in: eventIds } })
    .then(events => {
      return events.map(event => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: findCreator.bind(this, event.creator)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

const findCreator = userid => {
  return User.findById(userid)
    .then(creator => {
      return {
        ...creator._doc,
        _id: creator.id,
        eventsCreated: findEventsCreated.bind(this, creator._doc.eventsCreated)
      };
    })
    .catch(err => {
      throw err;
    });
};

export default {
  users: () => {
    return User.find()
      .then(users => {
        return users.map(user => {
          return {
            ...user._doc,
            eventsCreated: findEventsCreated.bind(this, user._doc.eventsCreated)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return {
            ...event._doc,
            _id: event.id,
            date: new Date(event._doc.date).toLocaleDateString(),
            creator: findCreator.bind(this, event.creator)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  createEvent: args => {
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date).toISOString(),
      creator: '5e463be52bdb035718551496'
    });
    let createdEvent;
    return event
      .save()
      .then(result => {
        createdEvent = {
          ...result._doc,
          _id: result.id,
          creator: findCreator.bind(this, result.creator)
        };
        return User.findById('5e463be52bdb035718551496');
      })
      .then(user => {
        if (!user) {
          throw new Error('User not found');
        }
        user.eventsCreated.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        throw err;
      });
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error('User already exists');
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, _id: result.id, password: null };
      })
      .catch(err => {
        throw err;
      });
  }
};
