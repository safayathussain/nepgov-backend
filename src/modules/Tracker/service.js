const { Tracker } = require("./model");
const { TrackerVote, TrackerOption } = require("./model");
const mongoose = require("mongoose");

const createTracker = async (trackerData) => {
  // Create voting options first
  const optionPromises = trackerData.options.map((option) =>
    TrackerOption.create({ content: option.content, color: option.color })
  );
  const createdOptions = await Promise.all(optionPromises);
  const optionIds = createdOptions.map((option) => option._id);

  // Create tracker with option references and categories as ObjectId
  const categoryIds = trackerData.categories.map(
    (category) => new mongoose.Types.ObjectId(category)
  );
  const tracker = await Tracker.create({
    ...trackerData,
    options: optionIds,
    categories: categoryIds,
  });

  return tracker.populate(["options", "categories"]);
};

const getAllTrackers = async (query = {}) => {
  const { category } = query;
  const filter = {};

  if (category) {
    filter.categories = category;
  }

  return await Tracker.find(filter)
    .populate(["options", "categories"]) // Populate categories field
    .sort({ createdAt: -1 });
};

const getTrackerById = async (id) => {
  const tracker = await Tracker.findById(id).populate([
    "options",
    "categories",
  ]);
  if (!tracker) throw new Error("Tracker not found");
  return tracker;
};
const checkVote = async (id, userId) => {
  const trackerVote = await TrackerVote.findOne({
    tracker: id,
    user: userId,
  });
  // if (!trackerVote) throw new Error("Tracker not found");
  return trackerVote;
};
const deleteTracker = async (id) => {
  const tracker = await Tracker.findByIdAndDelete(id);
  if (!tracker) throw new Error("Tracker not found");

  return;
};

const updateTracker = async (id, updateData, userId) => {
  const { editedOptions, deletedOptions, options, ...trackerData } = updateData;

  // Ensure that the tracker exists and belongs to the user
  const tracker = await Tracker.findOne({ _id: id });
  if (!tracker) throw new Error("Tracker not found");

  // First, handle the update of the tracker data itself (excluding options)
  const updatedTracker = await Tracker.findByIdAndUpdate(
    id,
    { $set: trackerData },
    { new: true }
  ).populate(["options", "categories"]);

  // Now, handle the edited options
  if (editedOptions && editedOptions.length > 0) {
    for (const option of editedOptions) {
      if (option._id) {
        const updatedOption = await TrackerOption.findByIdAndUpdate(
          option._id,
          option,
          {
            new: true,
          }
        );
        if (!updatedOption)
          throw new Error(`Option with ID ${option._id} not found`);
      } else {
        const newOption = await TrackerOption.create({
          content: option.content,
          color: option.color,
        });

        await Tracker.findByIdAndUpdate(
          id,
          { $push: { options: newOption._id } },
          { new: true }
        );
      }
    }
  }

  // Now, handle the deletion of options
  if (deletedOptions && deletedOptions.length > 0) {
    for (const deletedOption of deletedOptions) {
      const optionToDelete = await TrackerOption.findByIdAndDelete(
        deletedOption._id
      );
      if (!optionToDelete)
        throw new Error(`Option with ID ${deletedOption._id} not found`);
    }
  }

  // Return the updated tracker with populated options
  const finalTracker = await Tracker.findById(id).populate([
    "options",
    "categories",
  ]);
  return finalTracker;
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
  await TrackerOption.findByIdAndUpdate(optionId, { $inc: { votedCount: 1 } });
  await Tracker.findByIdAndUpdate(trackerId, { $inc: { votedCount: 1 } });
  return tracker.populate("options");
};

const addOption = async (trackerId, option) => {
  const tracker = await Tracker.findById(trackerId);
  if (!tracker) throw new Error("Tracker not found");
  const createdOption = await TrackerOption.create({
    content: option.content,
    color: option.color,
  });
  const updatedTracker = await Tracker.findByIdAndUpdate(
    trackerId,
    { $addToSet: { options: createdOption } },
    { new: true }
  );
  return createdOption;
};
const editOption = async (optionId, data) => {
  const option = await TrackerOption.findById(optionId);
  if (!option) throw new Error("Option not found");
  const updatedOption = await TrackerOption.findByIdAndUpdate(optionId, data, {
    new: true,
  });

  return updatedOption;
};

module.exports = {
  createTracker,
  updateTracker,
  getAllTrackers,
  getTrackerById,
  voteTracker,
  addOption,
  editOption,
  deleteTracker,
  checkVote,
};
