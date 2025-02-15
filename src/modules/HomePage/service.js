// service.js
const HomePage = require("./model");

const getHomePage = async () => {
  const homePage = await HomePage.findOne({})
  .populate({
    path: "hero.dailyQuestion",
    populate: { path: "options categories" },
  })
  .populate({
    path: "featuredSurveyTracker.surveys",
    populate: { path: "questions.options categories" },
  })
  .populate({
    path: "featuredSurveyTracker.trackers",
    populate: { path: "options categories" },
  })
  .populate({
    path: "liveSurveyTracker.data",
    populate: { path: "categories questions.options" },
  }) 

  return homePage;
};

const updateHomePage = async (homePageData) => {
  let homePage = await HomePage.findOne({});

  if (!homePage) {
    // If no homepage config exists, create a new one
    homePage = await HomePage.create(homePageData);
  } else {
    // Update existing homepage config and return the updated document
    homePage = await HomePage.findOneAndUpdate(
      {},
      { $set: homePageData },
      { new: true, returnDocument: "after" } // Ensure it returns a Mongoose document
    );
  } 
  return await homePage.populate([
    "hero.dailyQuestion",
    "featuredSurveyTracker.surveys",
    "featuredSurveyTracker.trackers",
    "liveSurveyTracker.data",
  ]);
};

module.exports = {
  getHomePage,
  updateHomePage,
};
