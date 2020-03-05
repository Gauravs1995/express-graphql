import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  eventsCreated: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    }
  ],
  eventsBooked: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Event'
    }
  ]
});

export default mongoose.model('User', userSchema);
