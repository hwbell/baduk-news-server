const app = require('../app');
const Review = require('../models/review.js');
const { compareDates } = require('../tools/helperFunctions');

const { userOne, userTwo, invalidReviewOne, invalidReviewTwo, reviewOne, reviewTwo, setupDatabase } = require('./testSetup/db');

// use supertest for route testing
const request = require('supertest');

describe('Reviews endpoints', () => {
  beforeEach(setupDatabase);

  it('should post a new review', async () => {
    const post = await request(app)
      .post('/reviews')
      .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
      .send(reviewTwo)
      .expect(201)
    // console.log(response.body)

    const review = await Review.findOne({ _id: reviewTwo._id });
    expect(review.name).toBe(reviewTwo.name)

    expect(post.body.name).toBe(reviewTwo.name)
  });

  it('should not post an invalid review', async () => {
    const post = await request(app)
    .post('/reviews')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(invalidReviewOne)
    .expect(400)
  // console.log(response.body)

    const review = await Review.findOne({ _id: invalidReviewOne._id });
    expect(review).toBeNull();
  })

  // it('should get all reviews according to date sorter', async () => {
  //   let sortBy = 'date';
  //   let page = 1;

  //   const get = await request(app)
  //     .get(`/reviews/all/${sortBy}/${page}`)
  //     .expect(200)

  //   let reviews = get.body;

  //   expect(reviews.length).toBe(10);
    
  //   // check if they are actually sorted
  //   let check = reviews.every((review, i) => {
      
  //     // check the date is more recent than the next review in line, if its there
  //     let nextReview = reviews[i+1];
  //     if (nextReview) {
  //       return compareDates(review.createdAt, nextReview.createdAt)
  //     }
  //     // this means we're at the end
  //     return true;
  //   })

  //   expect(check).toBe(true);
  // })

  // it('should get all reviews according to comments sorter', async () => {
  //   let sortBy = 'comments';
  //   let page = 2;

  //   const get = await request(app)
  //     .get(`/reviews/all/${sortBy}/${page}`)
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .expect(200)

  //   let reviews = get.body;

  //   expect(reviews.length).toBe(10);
    
  //   // check if they are actually sorted
  //   let check = reviews.every((review, i) => {
      
  //     // check the date is more recent than the next review in line, if its there
  //     let nextReview = reviews[i+1];

  //     if (nextReview) {
  //       // console.log(review.commentsCount, nextReview.commentsCount)
  //       return review.commentsCount >= nextReview.commentsCount
  //     }
  //     // this means we're at the end
  //     return true;
  //   })

  //   expect(check).toBe(true);
  // })

  // it('should get a users reviews', async () => {

  //   // get all the user's reviews, should be 16 there now
  //   const userOneResponse = await request(app)
  //     .get('/reviews/me')
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .expect(200)

  //   // console.log(get.body)
  //   expect(userOneResponse.body.length).toBe(16)

  //   const userTwoResponse = await request(app)
  //     .get('/reviews/me')
  //     .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
  //     .expect(200)

  //   // console.log(get.body)
  //   expect(userTwoResponse.body.length).toBe(15)

  // })

  // it('should get a single review', async () => {

  //   let _id = reviewOne._id.toString();

  //   const get = await request(app)
  //     .get(`/reviews/single/${_id}`)
  //     .expect(200)

  //     expect(get.body._id).toBe(reviewOne._id.toString())
  //     expect(get.body.owner).toBe(userOne._id.toString())

  // })

  // it('should patch a reviews info', async () => {

  //   let reviewPatch = {
  //     paragraph: 'Additional info and sources ... '
  //   }
  //   const patch = await request(app)
  //     .patch(`/reviews/${reviewOne._id}`)
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .send(reviewPatch)
  //     .expect(201)

  //   const review = await Review.findOne({ paragraph: 'Additional info and sources ... ' });
  //   expect(review.name).toBe(reviewOne.name)

  //   expect(patch.body._id).toBe(review._id.toString());
  // })

  // it('should modify a reviews comments', async () => {

  //   // define the comment to be added
  //   const commentsPatch = {
  //     user: userTwo.name,
  //     text: 'There is a lack of good data supporting the hypothesis in this article.',
  //     add: true
  //   }

  //   // patch the review with the new comment
  //   const patch = await request(app)
  //     .patch(`/reviews/comments/${reviewOne._id}`)
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .send(commentsPatch)
  //     .expect(201)

  //   // assert it worked
  //   let review = await Review.findOne({ _id: reviewOne._id });
  //   expect(review.comments[review.comments.length - 1]).toMatchObject(commentsPatch);

  //   expect(patch.body._id).toBe(review._id.toString());
  //   expect(review.commentsCount).toBe(review.comments.length)


  //   // define the comment to be removed
  //   const commentsRemove = reviewOne.comments[0];

  //   // now try removing the first pre-existing comment
  //   const remove = await request(app)
  //     .patch(`/reviews/comments/${reviewOne._id}`)
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .send(commentsRemove)
  //     .expect(201)

  //   // assert it worked - now the first comment should be the one we added, and there should be only 1 comment
  //   review = await Review.findOne({ _id: reviewOne._id });
  //   expect(review.comments[0]).toMatchObject(commentsPatch);
    
  //   expect(remove.body._id).toBe(review._id.toString());    

  // })

  // it('should delete review', async () => {
  //   const patch = await request(app)
  //     .delete(`/reviews/${reviewOne._id}`)
  //     .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
  //     .expect(200)

  //   const review = await Review.findOne({ _id: reviewOne._id });
  //   expect(review).toBeNull();

  //   // assert we get the user's reviews back, length being -1 from above
  //   expect(patch.body.length).toBe(15);
    
  //   patch.body.forEach( (item) => {
  //     expect(item.owner).toBe(userOne._id.toString());
  //   });

  // })

})

