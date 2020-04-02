var express = require('express');
var router = express.Router();
require('../db/mongoose')
const auth = require('../middleware/auth');
const Review = require('../models/review');

/* POST a new review */
router.post('/', auth, async (req, res, next) => {
  // first process the file + save to s3
    // load to s3

    // return string of link to s3 obj as review.game
    

  // then, save with schema

  console.log(req.body);
  
  const review = new Review({
    ...req.body,
    owner: req.user._id
  })

  try {
    await review.save();
    
    res.status(201).send(review);
  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

// GET reviews (all) with the page + sortBy params. 
// sort the reviews accordingly, and send back the page requested
router.get('/all/:sortBy/:page', async (req, res, next) => {

  let { sortBy, page } = req.params;

  console.log(sortBy, page)

  try {
    let allowedSorters = ['date', 'comments'];
    if (!allowedSorters.includes(sortBy)) {
      console.log('Invalid or missing sort parameter.')
      return res.status(404).send();
    }

    page = Number(page);
    if (page === NaN) {
      return res.status(404).send('Invalid or missing page parameter.');
    }

    let reviews;

    if (sortBy === 'comments') {
      reviews = await Review.find({}).sort({ commentsCount: -1 })
    } else {
      reviews = await Review.find({}).sort({ createdAt: -1 })
    }

    let start = page * 10 - 10;
    let end = page * 10;

    console.log('just before sending')
    res.send(reviews.slice(start, end));

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

/* GET a single review */
router.get('/single/:id', async (req, res, next) => {

  console.log('request for single review')

  const _id = req.params.id;

  try {
    const review= await Review.findOne({ _id });

    if (!review) {
      return res.status(404).send();
    }

    res.send(review);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
})

/* GET user's reviews */
router.get('/me', auth, async (req, res, next) => {
  try {
    const reviews = await Review.find({ owner: req.user._id });

    if (!reviews) {
      return res.status(404).send();
    }

    res.send(reviews);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }
})

/* PATCH a user's review info */
router.patch('/:id', auth, async (req, res, next) => {

  // console.log(req.body)
  const updates = Object.keys(req.body);
  const allowedUpdates = ['paragraph', 'name', 'article'];
  const isValidUpdate = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidUpdate) {
    return res.status(400).send({
      error: 'Invalid update.'
    })
  }

  try {
    const review = await Review.findOne({ _id: req.params.id, owner: req.user._id });
    // const collection = await Collection.findById(req.params.id);

    if (!review) {
      return res.status(404).send();
    }

    updates.forEach((update) => {
      review[update] = req.body[update];
    });
    review.lastUpdated = new Date();

    await review.save();

    // send the new review back
    const updatedReview = await Review.findOne({ _id: req.params.id, owner: req.user._id });
    res.status(201).send(updatedReview);

  } catch (e) {
    res.status(400).send(e);
  }

})

/* PATCH a review's comments */
router.patch('/comments/:id', auth, async (req, res, next) => {
  const _id = req.params.id;
  const newComment = req.body;

  if (!newComment || !newComment.text || !newComment.user) {
    res.status(400).send({
      error: 'Invalid comments entry.'
    })
  }

  try {
    // get the review from the db
    const review = await Review.findOne({ _id });
    console.log('review found')

    if (!review) {
      return res.status(404).send();
    }

    // if its an addition, add the comment onto the comments
    if (newComment.add) {
      console.log('adding comment')
      newComment.createdAt = new Date();

      review.comments.push(newComment);
    }
    // otherwise, remove it
    else {
      let comments = review.comments;
      comments = comments.filter(comment => comment.text !== newComment.text);
      review.comments = comments;
    }

    review.lastUpdated = new Date();
    await review.save();

    // send the new review back
    const updatedReview = await Review.findOne({ _id });
    console.log(updatedReview)
    res.status(201).send(updatedReview);

  } catch (e) {
    console.log(e)
    res.status(400).send(e);
  }

})

/* DELETE a user's review */
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

    if (!review) {
      return res.status(404).send();
    }
    // send the new list back
    const reviews = await Review.find({owner: req.user._id}).sort({ createdAt: -1 });
    res.send(reviews);

  } catch (e) {
    res.statusCode(400).send;
  }
})

module.exports = router;
