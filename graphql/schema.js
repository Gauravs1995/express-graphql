import { buildSchema } from 'graphql';

export default buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: User!
      attendees: [User!]
    }
    
    type User {
      firstname: String!
      lastname: String!
      _id: ID!
      email: String!
      password: String
      eventsCreated: [Event!]
      eventsBooked: [Event!]
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      firstname: String!
      lastname: String!
      email: String!
      password: String!
    }
    type AuthData {
      userId: ID!
      token: String!
      tokenExpiration: Int!
    }
    type rootQuery {
      events: [Event!]!
      login(email: String!, password: String!): AuthData!
      
    }

    type rootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
      rsvpEvent(eventId: ID!): Event
      cancelBooking(eventId: ID!): Boolean 
    }

    schema {
      query:rootQuery
      mutation:rootMutation
    }`);
