import jwt from 'jsonwebtoken';
import Event from '../models/event.model';
import bcrypt from 'bcryptjs';
import User from '../models/user.model';

const findEvents = eventIds => {
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
        password: null,
        eventsCreated: findEvents.bind(this, creator._doc.eventsCreated)
      };
    })
    .catch(err => {
      throw err;
    });
};

const findAttendees = userIds => {
  return User.find({ _id: { $in: userIds } })
    .then(users => {
      return users.map(user => {
        return {
          ...user._doc,
          _id: user.id,
          email: user.email,
          password: null,
          eventsBooked: findEvents.bind(this, user.eventsBooked)
        };
      });
    })
    .catch(err => {
      throw err;
    });
};

export default {
  login: ({ email, password }) => {
    let userExists;
    return User.findOne({ email: email })
      .then(user => {
        if (!user) {
          throw new Error('User does not exist');
        }
        userExists = user;
        return bcrypt.compare(password, user.password);
      })
      .then(match => {
        if (!match) {
          throw new Error('Incorrect password');
        }
        const token = jwt.sign(
          { userId: userExists.id, email: userExists.email },
          'somesuperlongkey',
          { expiresIn: '1h' }
        );
        return { userId: userExists.id, token: token, tokenExpiration: 1 };
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
            creator: findCreator.bind(this, event.creator),
            attendees: findAttendees.bind(this, event.attendees)
          };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  createEvent: (args, req) => {
    if (!req.isAuth) {
      throw new Error('User Unauthenticated');
    }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date).toDateString(),
      creator: req.userId
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
        return User.findById(req.userId);
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
  },
  rsvpEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error('User Unauthenticated');
    }
    const event = await Event.findById(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }
    const user = await User.findById(args.userId);
    event.attendees.push(user);
    user.eventsBooked.push(event);
    await user.save();
    const bookedEvent = await event.save();
    return {
      ...bookedEvent._doc,
      _id: bookedEvent.id,
      creator: findCreator.bind(this, bookedEvent.creator),
      attendees: findAttendees.bind(this, bookedEvent.attendees)
    };
  }
};
