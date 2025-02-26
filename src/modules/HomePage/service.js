const HomePage = require("./model");
const { Tracker } = require("../Tracker/model");
const { Survey } = require("../Survey/model");
const { isLive } = require("../../utils/function");
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
      populate: { path: "categories" },
    });
  for (let item of homePage.liveSurveyTracker) {
    if (item.data) {
      if (item.type === "Survey") {
        await item.data.populate("questions.options");
      } else if (item.type === "Tracker") {
        await item.data.populate("options");
      }
    }
  }
  return homePage;
};

const updateHomePage = async (homePageData) => {
  let homePage = await HomePage.findOne({});

  if (!homePage) {
    homePage = await HomePage.create(homePageData);
  } else {
    if (homePageData.liveSurveyTracker) {
      // First map to create array of Promises that resolve to boolean values
      const filterResults = await Promise.all(
        homePageData.liveSurveyTracker.map(async (item) => {
          if (item?.type === "Survey") {
            const survey = await Survey.findById(item.data);
            return isLive(survey?.liveEndedAt);
          } else {
            const tracker = await Tracker.findById(item.data);
            return isLive(tracker?.liveEndedAt);
          }
        })
      );
      
      // Then filter the original array using the results
      homePageData.liveSurveyTracker = homePageData.liveSurveyTracker.filter(
        (_, index) => filterResults[index]
      );
    }

    homePage = await HomePage.findOneAndUpdate(
      {},
      { $set: homePageData },
      { new: true, returnDocument: "after" }
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
