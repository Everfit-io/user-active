import { Schema, model } from 'mongoose';

const ProfileSchema = new Schema({
  is_trainer: {
    type: Boolean,
    required: true,
  },
  is_demo: {
    type: Boolean,
    default: false,
  },
},
// additional configuration
{
  timestamps: true,
});

export default model('profile', ProfileSchema);
