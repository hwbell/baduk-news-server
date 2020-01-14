const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../models/user");
const Collection = require("../../models/collection");
const Thread = require("../../models/thread");

const userOneId = new mongoose.Types.ObjectId();
const userTwoId = new mongoose.Types.ObjectId();
const userThreeId = new mongoose.Types.ObjectId();
const collectionOneId = new mongoose.Types.ObjectId();
const collectionTwoId = new mongoose.Types.ObjectId();
const collectionThreeId = new mongoose.Types.ObjectId();

const randomId = new mongoose.Types.ObjectId();

// use this to randomize the dates, so we can test the sorting
function randomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

// define some users and collections - when we initialize the database below, we will
// save one user(userOne) with one collection(collectionOne)
const userOne = {
  _id: userOneId,
  name: "Jeff",
  rank: "5kyu",
  picture: `s3.url-${Math.random().toString()}`,
  password: "regexmixup",
  email: "mogget@mail.com",
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }
  ]
};
const userTwo = {
  _id: userTwoId,
  name: "Mark",
  rank: "5dan",
  picture: `s3.url-${Math.random().toString()}`,
  password: "asufrubf!!!",
  email: "mark@mail.com",
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }
  ]
};
const userThree = {
  _id: userThreeId,
  name: "Duder",
  rank: "2kyu",
  picture: `s3.url-${Math.random().toString()}`,
  password: "asufrubf!!!",
  email: "maduder@mail.com",
  tokens: [
    {
      token: jwt.sign({ _id: userThreeId }, process.env.JWT_SECRET)
    }
  ]
};

const collectionOne = {
  _id: collectionOneId,
  owner: userOneId,
  name: "Cancer Biology",
  articles: [
    {
      PMID: "294378234"
    },
    {
      PMID: "310460980"
    }
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())
};

const collectionTwo = {
  _id: collectionTwoId,
  owner: userTwoId,
  name: "Immunology",
  articles: [
    {
      PMID: "324926597"
    },
    {
      PMID: "987984637"
    }
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())
};

const collectionThree = {
  _id: collectionThreeId,
  owner: userTwoId,
  name: "Neuroscience",
  articles: [
    {
      PMID: "565738290"
    },
    {
      PMID: "246560280"
    }
  ],
  createdAt: randomDate(new Date(2016, 0, 1), new Date())
};

// define some VALID threads
const threadOne = {
  owner: userOneId,
  user: userOne.name,
  _id: collectionOneId,
  name: `Shin Jinseo dominates (again)`,
  picture: `s3.url-${Math.random().toString()}`,
  comments: [
    {
      user: userTwo.name,
      text: `I don't totally understand his strategy at the opening ... but man, what domination.`
    }
  ],
  paragraph: `A game between Shin Jinseo and Tang Weixing this last month at the Tengen. White seems
  behind for a bit at the beginning, but later on just crushes black's main territory, killing a group
  in the process.`,
  tags: ["#shinjinseo", "#tangweixing", "#killing", "#tengen"]
};

const threadTwo = {
  owner: userTwoId,
  user: userTwo.name,
  _id: collectionTwoId,
  name: `Lee Changho slays a dragon`,
  picture: `s3.url-${Math.random().toString()}`,
  comments: [
    {
      user: userOne.name,
      text: "Is the forcing move @L3 necessary? Or personal choice?"
    }
  ],
  paragraph: `Perhaps a bit uncharacteristic of stone buddha, he kills a very large group for the victory.
  I think the game was actually very close, but black left something open and lost.`,
  tags: ["#leechangho", "#changhao", "#killing"]
};

let manyThreads = [];
for (let i = 0; i < 30; i++) {
  let thread = {
    owner: i % 2 === 0 ? userOneId : userTwoId,
    user: `user-${i + 1}`,
    _id: new mongoose.Types.ObjectId(),
    name: Math.random().toString(),
    picture: `s3.url-${Math.random().toString()}`,
    paragraph: `Perhaps a bit uncharacteristic of stone buddha, he kills a very large group for the victory.
  I think the game was actually very close, but black left something open and lost.`,
    tags: ["#leechangho", "#changhao", "#killing"],
    comments: [
      {
        user: i % 2 === 0 ? userOne.name : userTwo.name,
        text: "Is the forcing move @L3 necessary? Or personal choice?"
      }
    ],
    commentsCount: Math.floor(Math.random() * 100),
    createdAt: randomDate(new Date(2016, 0, 1), new Date())
  };
  manyThreads.push(thread);
}

// define some INVALID threads
// lacking an owner
const invalidThreadOne = {
  owner: userOneId,
  user: userOne.name,
  _id: randomId,
  name: `Shin Jinseo dominates (again)`,
  picture: `s3.url-${Math.random().toString()}`,
  comments: [
    {
      user: userTwo.name,
      text: `I don't totally understand his strategy at the opening ... but man, what domination.`
    }
  ]
};
// lacking a file link
const invalidThreadTwo = {
  owner: userTwoId,
  user: userTwo.name,
  _id: randomId,
  name: `Lee Changho slays a dragon`,
  picture: `s3.url-${Math.random().toString()}`,
  comments: [
    {
      user: userOne.name,
      text: "Is the forcing move @L3 necessary? Or personal choice?"
    }
  ]
};

// wipe and setup both the User and Collection schemas for testing
const setupDatabase = async () => {
  await User.deleteMany();
  await Collection.deleteMany();
  await Thread.deleteMany();

  // save users - userOne + userTow
  await new User(userOne).save();
  await new User(userTwo).save();

  // save one collection with userOne as its owner
  await new Collection(collectionOne).save();

  // save one collection with userTwo as its owner
  await new Collection(collectionTwo).save();

  // save another collection with userTwo as its owner
  await new Collection(collectionThree).save();

  // // save one thread with userOne as its owner
  await new Thread(threadOne).save();

  // then throw some others in there
  for (let i = 0; i < manyThreads.length; i++) {
    await new Thread(manyThreads[i]).save();
  }
};

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  userThree,
  userThreeId,
  collectionOne,
  collectionTwo,
  collectionThree,
  threadOne,
  threadTwo,
  invalidThreadOne,
  invalidThreadTwo,
  setupDatabase
};
