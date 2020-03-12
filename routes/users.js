var express = require('express');
var router = express.Router();

require('../db/mongoose');
const User = require('../models/user');
const Thread = require('../models/thread');
const auth = require('../middleware/auth');

// get basic site info for users - count, etc.
router.get('/all', async (req, res) => {

  try { 
    const users = await User.find({});
    const threads = await Thread.find({});
    // const reviews = await User.find({});
    const userCount = users.length;
    const threadCount = threads.length;
    res.send({ 
      users: userCount,
      articles: threadCount
    });

  } catch(e) {
    res.status(400).send(e);
  }
})


/* POST a new user */
router.post('/', async (req, res, next) => {
  const user = new User(req.body);
  console.log(req.body || 'nothing received')

  try {
    await user.save();
    console.log('user saved')
    const token = await user.generateAuthToken()
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }

});

// login a user
router.post('/login', async (req, res) => {

  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
})

/* GET user's profile (logged in)*/
router.get('/me', auth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/* PATCH a user's profile */
router.patch('/me', auth, async (req, res) => {

  const _id = req.user._id;

  const updates = Object.keys(req.body);
  const allowedUpdates = ['about', 'research', 'affiliations', 'interests'];
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
  // 
  if (!isValidUpdate) {
    
    return res.status(400).send({
      error: 'Invalid update.'
    })
  }

  try {
    const user = await User.findOne({ _id: req.user._id })
    // const collection = await Collection.findById(req.params.id);
    // 
    if (!user) {
      console.log('no user found')
      return res.status(404).send();
    }

    updates.forEach((update) => {
      user[update] = req.body[update];
      console.log(`${user.name}'s ${update} is now set to ${req.body[update]}`)
    });
    user.lastUpdated = new Date();

    await user.save();

    //   // send the new list back
    const updatedUser = await User.findOne({ _id });

    res.status(201).send(updatedUser);


  } catch (e) {
    res.status(400).send(e);
  }

})

// logout a user
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    })
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
})

// logout of all sessions / wipe the tokens array
router.post('/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
})

// delete a user
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
})


module.exports = router;
