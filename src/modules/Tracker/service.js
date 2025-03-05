const { calculateAge, isLive } = require("../../utils/function");
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

  const trackers = await Tracker.find(filter)
    .populate(["options", "categories"])
    .sort({ createdAt: -1 });

  const trackerWithVotes = await Promise.all(
    trackers.map(async (item) => {
      const votes = await TrackerVote.find({ tracker: item._id }).populate(
        "option"
      );
      const monthYearVotes = {};

      if (votes.length > 0) {
        const voteDates = votes.map((vote) => new Date(vote.createdAt));
        const startDate = new Date(Math.min(...voteDates));
        const endDate = new Date(Math.max(...voteDates));

        startDate.setDate(1);
        endDate.setDate(1);

        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setMonth(date.getMonth() + 1)
        ) {
          const monthYearKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          monthYearVotes[monthYearKey] = {
            total: 0,
            options: item.options.reduce((acc, option) => {
              acc[option._id.toString()] = {
                votes: 0,
                content: option.content,
                color: option.color,
              };
              return acc;
            }, {}),
          };
        }

        votes.forEach((vote) => {
          const voteDate = new Date(vote.createdAt);
          const monthYearKey = `${voteDate.getFullYear()}-${String(
            voteDate.getMonth() + 1
          ).padStart(2, "0")}`;

          if (monthYearVotes[monthYearKey]) {
            monthYearVotes[monthYearKey].total++;
            monthYearVotes[monthYearKey].options[vote.option._id.toString()]
              .votes++;
          }
        });
      }

      // Add previous month if monthYearVotes has only one key
      if (Object.keys(monthYearVotes).length === 1) {
        const currentKey = Object.keys(monthYearVotes)[0];
        const [year, month] = currentKey.split("-").map(Number);

        let prevYear = year;
        let prevMonth = month - 1;

        if (prevMonth === 0) {
          prevMonth = 12;
          prevYear--;
        }

        const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(
          2,
          "0"
        )}`;

        monthYearVotes[prevMonthKey] = {
          total: 0,
          options: item.options.reduce((acc, option) => {
            acc[option._id.toString()] = {
              votes: 0,
              content: option.content,
              color: option.color,
            };
            return acc;
          }, {}),
        };
      }

      return { ...item.toObject(), monthYearVotes };
    })
  );

  return trackerWithVotes;
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
  return trackerVote;
};
const trackerResult = async (trackerId, query) => {
  try {
    // Parse query parameters
    const ageRange = query.age ? query.age.split("-").map(Number) : null;
    const gender = query.gender === "null" ? null : query.gender ?? null;
    const city = query.city || null;
    const country = query.country || null;
    const state_province = query.state_province || null;
    const monthDuration = query.monthDuration
      ? parseInt(query.monthDuration)
      : null;

    // Get tracker with options
    const tracker = await Tracker.findById(trackerId).populate("options");
    if (!tracker) {
      throw new Error("Tracker not found");
    }

    // Get all votes for this tracker
    let votes = await TrackerVote.find({ tracker: trackerId })
      .populate("option")
      .populate("user");

    // Filter votes based on user criteria
    votes = votes.filter((vote) => {
      const user = vote.user;
      if (!user) return false;
      if (gender && user.gender !== gender) return false;
      if (ageRange) {
        const userAge = calculateAge(user.dob);
        if (userAge < ageRange[0] || userAge > ageRange[1]) return false;
      }
      if (country && user.country !== country) return false;
      if (city && user.city !== city) return false;
      if (state_province && user.state_province !== state_province)
        return false;
      return true;
    });

    // Initialize monthYearVotes object
    const monthYearVotes = {};

    // Find date range
    let startDate, endDate;
    if (monthDuration) {
      endDate = new Date(tracker.liveEndedAt);
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() + 1 - monthDuration, 1);
      // startDate.setDate(1); // Ensure it's the first day
    } else {
      startDate = new Date(tracker.liveStartedAt);
      endDate = new Date(tracker.liveEndedAt);
    }

    // Set to first of the month for consistent comparison
    startDate.setDate(1);

    // Create entries for each month in the range
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setMonth(date.getMonth() + 1)
    ) {
      const monthYearKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthYearVotes[monthYearKey] = {
        total: 0,
        options: tracker.options.reduce((acc, option) => {
          acc[option._id.toString()] = {
            votes: 0,
            content: option.content,
            color: option.color,
          };
          return acc;
        }, {}),
      };
    }

    // Count votes for each month
    votes.forEach((vote) => {
      const voteDate = new Date(vote.createdAt);
      if (voteDate >= startDate && voteDate <= endDate) {
        const monthYearKey = `${voteDate.getFullYear()}-${String(
          voteDate.getMonth() + 1
        ).padStart(2, "0")}`;

        if (monthYearVotes[monthYearKey]) {
          monthYearVotes[monthYearKey].total++;
          monthYearVotes[monthYearKey].options[vote.option._id.toString()]
            .votes++;
        }
      }
    });

    // Add previous month if only one month exists
    if (Object.keys(monthYearVotes).length === 1) {
      const currentKey = Object.keys(monthYearVotes)[0];
      const [year, month] = currentKey.split("-").map(Number);

      let prevYear = year;
      let prevMonth = month - 1;

      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear--;
      }

      const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

      monthYearVotes[prevMonthKey] = {
        total: 0,
        options: tracker.options.reduce((acc, option) => {
          acc[option._id.toString()] = {
            votes: 0,
            content: option.content,
            color: option.color,
          };
          return acc;
        }, {}),
      };
    }

    // Calculate total votes for each option across all months
    const optionTotalVotes = tracker.options.reduce((acc, option) => {
      acc[option._id.toString()] = votes.filter(
        (vote) => vote.option._id.toString() === option._id.toString()
      ).length;
      return acc;
    }, {});

    // Convert to chart.js format
    const labels = Object.keys(monthYearVotes)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        return new Date(year, month - 1).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      });

    const datasets = tracker.options.map((option) => {
      const optionId = option._id.toString();
      return {
        label: option.content,
        data: Object.keys(monthYearVotes)
          .sort()
          .map((monthKey) => {
            const monthData = monthYearVotes[monthKey];
            const optionVotes = monthData.options[optionId].votes;
            return monthData.total === 0
              ? "0.0"
              : ((optionVotes / monthData.total) * 100).toFixed(1);
          }),
        borderColor: option.color,
        backgroundColor: `${option.color}80`,
        tension: 0.4,
      };
    });

    return {
      labels,
      datasets,
      // monthlyData: monthYearVotes,
      totalVotes: votes.length,
      topic: tracker.topic,
      options: tracker.options.map((option) => {
        const optionId = option._id.toString();
        const optionVotes = optionTotalVotes[optionId];
        return {
          _id: option._id,
          content: option.content,
          color: option.color,
          totalVotes: optionVotes,
          percentage:
            votes.length > 0
              ? ((optionVotes / votes.length) * 100).toFixed(1)
              : "0.0",
        };
      }),
    };
  } catch (error) {
    throw new Error(`Error analyzing tracker data: ${error.message}`);
  }
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
  const isLive = isLive(tracker.liveStartedAt, tracker.liveEndedAt);
  if(!isLive){
    throw new Error("The tracker is no longer live")
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
  trackerResult,
};
