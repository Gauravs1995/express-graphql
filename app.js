import express from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';
import mongoose from 'mongoose';
import graphqlSchema from './graphql/schema';
import graphqlResolver from './graphql/resolver';
import isAuth from './middleware/isAuth';

const app = express();
app.use(bodyParser.json());
app.use(isAuth);
app.use(
  '/graphql',
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo-cluster1-ub2rk.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => {
    console.log('SUCCESS - APP listening on 3000');
    app.listen(3000);
  })
  .catch(err => {
    console.log('MY-ERROR ' + err);
  });
