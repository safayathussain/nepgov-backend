// service.js
const { Tracker } = require("./model");
const VotingOption = require("../votingOption/model");
const { TrackerVote } = require("./model");

const createTracker = async (trackerData) => {
  // Create voting options first
  const optionPromises = trackerData.options.map((option) =>
    VotingOption.create({ content: option.content, color: option.color })
  );
  const createdOptions = await Promise.all(optionPromises);
  const optionIds = createdOptions.map((option) => option._id);

  // Create tracker with option references
  const tracker = await Tracker.create({
    ...trackerData,
    options: optionIds,
  });

  return tracker.populate(["options", "user"]);
};

const getAllTrackers = async (query = {}) => {
  const {  categories } = query;
  const filter = {};
 

  if (categories) {
    filter.categories = { $in: categories.split(",") };
  }

  return await Tracker.find(filter)
    .populate(["options"])
    .sort({ createdAt: -1 });
};

const getTrackerById = async (id) => {
  const tracker = await Tracker.findById(id).populate(["options"]);
  if (!tracker) throw new Error("Tracker not found");
  return tracker;
};

const updateTracker = async (id, updateData, userId) => {
  const tracker = await Tracker.findOne({ _id: id, user: userId });
  if (!tracker) throw new Error("Tracker not found or unauthorized");

  const updatedTracker = await Tracker.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).populate(["options"]);

  return updatedTracker;
};

const voteTracker = async (trackerId, optionId, userId) => {
  const tracker = await Tracker.findById(trackerId);
  if (!tracker) throw new Error("Tracker not found");
  if (!tracker.options.includes(optionId)) {
    throw new Error("Invalid option for this tracker");
  }
  const existingVote = await TrackerVote.findOne({
    tracker: trackerId,
    user: userId,
  });
  if (existingVote) {
    throw new Error("User has already voted");
  }
  await TrackerVote.create({
    tracker: trackerId,
    user: userId,
    option: optionId,
  });
  await VotingOption.findByIdAndUpdate(optionId, { $inc: { votedCount: 1 } });
};
const addOption = async (trackerId, option) => {
  const tracker = await Tracker.findById(trackerId);
  if (!tracker) throw new Error("Tracker not found");
  const createdOption = await VotingOption.create({ content: option.content, color: option.color });
  const updatedTracker = await Tracker.findByIdAndUpdate(
    trackerId,
    { $addToSet: { options: createdOption } }, 
    { new: true }
  );
  return createdOption
};

module.exports = {
  createTracker,
  updateTracker,
  getAllTrackers,
  getTrackerById,
  voteTracker,
  addOption,
};
