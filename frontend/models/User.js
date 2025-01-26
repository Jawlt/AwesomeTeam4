import mongoose from 'mongoose';

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  presentationId: { type: String, default:'' },
  students: {
    type: [String],
    default: [],
  }
}, { _id: false });

const UserSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, default: 'teacher' },
    lastLogin: { type: Date, default: Date.now },
    lectures: {
      type: [LectureSchema],
      default: [
        {
          title: 'Untitled Lecture',
          url: 'https://localhost:3000/',
          students: []
        }
      ]
    }
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
