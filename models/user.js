const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Collection = require('./collection')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is not valid')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain the word "password", thats crazy')
      }
    }
  },
  rank: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (!value) {
        throw new Error('You must declare a rank!')
      }
    }
  },
  about: {
    type: String
  },
  interests: {
    type: String
  },
  // this will just be a string of the s3 url
  // it isn't required to be unique since many users will not upload a photo => picture will be null for all these
  picture: {
    type: String, 
  },
  reviews: {
    type: String, 

  },
  articles: {

  },
  comments: {

  },
  links: {

  },


  tokens: [
    { 
      token: {
        type: String,
        required: true
      } 
    }
  ]
})

userSchema.virtual('threads', {
  ref: 'Thread',
  localField: '_id',
  foreignField: 'owner'
})

// methods available on instances
userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
  
  user.tokens = user.tokens.concat({ token });
  await user.save();
  
  return token;
}

// statics available on models
userSchema.statics.findByCredentials = async (email, password) => {
  console.log('looking ... ')
  const user = await User.findOne({ email });
  console.log('user found')

  if (!user) {
    throw new Error('Unable to login')
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to logn')
  }

  return user;
}

// Hash the plaintext password before saving
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
})

// Delete the user's collections if they delete their profile
userSchema.pre('remove', async function (next) {
  const user = this;

  await Collection.deleteMany({ owner: user._id});

  next();
})

const User = mongoose.model('User', userSchema);
User.createIndexes();

module.exports = User;