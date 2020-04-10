const {uploadFile} = require('./fileUploader');

// define some VALID reviews
const reviewOne = {
  owner: userOneId,
  user: userOne.name,
  _id: collectionOneId,
  name: `Shin Jinseo dominates (again)`,
  // game: `s3.url-${Math.random().toString()}`,
  paragraph: `A game between Shin Jinseo and Tang Weixing this last month at the Tengen. White seems
  behind for a bit at the beginning, but later on just crushes black's main territory, killing a group
  in the process.`,
  tags: ["#shinjinseo", "#tangweixing", "#killing", "#tengen"],
  comments: [
    {
      user: userTwo.name,
      text: `I don't totally understand his strategy at the opening ... but man, what domination.`
    }
  ],
};

// make some sample FormData 
const formData = new FormData(reviewOne)
formData.append('file', require('./testFiles/__go4go_20191216_Gu-Li_Xie-He.sgf'));


describe('fileUploader', () => {

  it('should upload a file', async () => {
    uploadFile('./testFiles/__go4go_20191216_Gu-Li_Xie-He.sgf')

    
  })



})