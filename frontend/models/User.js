import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    emailVerified: { type: Boolean, default: false },
    role: { type: String, default: 'teacher' },
    lastLogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'users',  // Explicitly specify the collection name
  }
);

// Export the model with proper collection binding
export default mongoose.models.User || mongoose.model('User', UserSchema);
