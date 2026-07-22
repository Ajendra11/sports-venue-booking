import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define the structural blueprint for a user/auth document in MongoDB
const authSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Excludes password from query results by default
  },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'admin'],
      message: 'Role must be either "user" or "admin"'
    },
    default: 'user'
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^\+?[\d\s-]{7,15}$/, 'Please provide a valid phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt fields automatically
});

// 2. Pre-save middleware: Hash the password before saving to database
authSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt with 12 rounds (good balance of security and performance)
    const salt = await bcrypt.genSalt(12);
    // Hash the password with the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 3. Instance method: Compare a candidate password against the stored hash
authSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 4. Transform the returned JSON object (strip sensitive fields)
authSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

// 5. Export the compiled Mongoose model
// Mongoose will automatically look for a collection named "users" in Atlas
const Auth = mongoose.model('Auth', authSchema);
export default Auth;

