const { isLive, calculateAge } = require("../../utils/function");
const { Survey, SurveyVote, SurveyQuestionOption } = require("./model");
const mongoose = require("mongoose");


const createSurvey = async (surveyData) => {
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create options documents first
    const questionsWithOptions = await Promise.all(
      surveyData.questions.map(async (questionData) => {
        const options = await SurveyQuestionOption.insertMany(
          questionData.options.map((opt) => ({
            content: opt.content,
            color: opt.color,
          })),
          { session }
        );

        return {
          question: questionData.question,
          options: options.map((opt) => opt._id),
        };
      })
    );

    // Create the survey document
    const [survey] = await Survey.create(
      [
        {
          ...surveyData,
          questions: questionsWithOptions,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    // Fetch and populate the created survey
    return await Survey.findById(survey._id).populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
const updateSurvey = async (surveyId, updateData) => {
  const {
    updatedQuestions,
    topic,
    categories,
    thumbnail,
    liveEndedAt,
    liveStartedAt,
    questions,
  } = updateData;
  const deletedQuestions = JSON.parse(updateData.deletedQuestions);
  // Find the survey by ID
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new Error("Survey not found");

  // Update survey metadata
  if (topic) survey.topic = topic;
  if (categories) survey.categories = categories;
  if (thumbnail) survey.thumbnail = thumbnail;
  if (liveEndedAt) survey.liveEndedAt = liveEndedAt;
  if (liveStartedAt) survey.liveStartedAt = liveStartedAt;
  // for creating new questions
  if (questions && questions.length > 0) {
    for (const questionData of questions) {
      // Create a new question
      const newQuestion = {
        question: questionData.question,
        options: [], // Initialize options as an empty array
      };

      // Create and link new options to the question
      if (questionData.options && questionData.options.length > 0) {
        for (const optionData of questionData.options) {
          // Create a new option
          const newOption = new SurveyQuestionOption({
            content: optionData.content,
            color: optionData.color,
          });
          await newOption.save(); // Save the new option to the database

          // Link the new option to the question
          newQuestion.options.push(newOption._id);
        }
      }

      // Add the new question to the survey
      survey.questions.push(newQuestion);
    }
  }
  // Handle updated questions
  if (updatedQuestions && updatedQuestions.length > 0) {
    for (const questionData of updatedQuestions) {
      let question;
      questionData.updatedOptions = JSON.parse(questionData.updatedOptions);
      questionData.deletedOptions = JSON.parse(questionData.deletedOptions);
      if (questionData._id) {
        // Update existing question
        question = survey.questions.id(questionData._id);
        if (!question)
          throw new Error(`Question with ID ${questionData._id} not found`);

        // Update question text if provided
        if (questionData.question) {
          question.question = questionData.question;
        }
      } else {
        // Create new question
        question = {
          question: questionData.question,
          options: [], // Initialize options as an empty array
        };
        survey.questions.push(question);
      }
      // Handle updated options
      if (
        questionData.updatedOptions &&
        questionData.updatedOptions.length > 0
      ) {
        for (const option of questionData.updatedOptions) {
          if (option._id) {
            // Update existing option
            const existingOption = await SurveyQuestionOption.findById(
              option._id
            );
            if (!existingOption)
              throw new Error(`Option with ID ${option._id} not found`);
            existingOption.content = option.content;
            existingOption.color = option.color;
            await existingOption.save();
          } else {
            // Create new option
            const newOption = new SurveyQuestionOption({
              content: option.content,
              color: option.color,
            });
            await newOption.save();
            question.options.push(newOption._id); // Link the new option to the question
          }
        }
      }

      // Handle deleted options
      if (
        questionData.deletedOptions &&
        questionData.deletedOptions.length > 0
      ) {
        for (const deletedOptionId of questionData.deletedOptions) {
          // Remove the option from the database
          await SurveyQuestionOption.findByIdAndDelete(deletedOptionId);

          // Remove the option from the question's options array
          question.options = question.options.filter(
            (opt) => !opt.equals(deletedOptionId)
          );
        }
      }
    }
  }
  // Handle deleted questions
  if (deletedQuestions && deletedQuestions.length > 0) {
    for (const deletedQuestionId of deletedQuestions) {
      const questionToDelete = survey.questions.id(deletedQuestionId);
      if (!questionToDelete)
        throw new Error(`Question with ID ${deletedQuestionId} not found`);

      // Delete all options associated with this question
      await SurveyQuestionOption.deleteMany({
        _id: { $in: questionToDelete.options },
      });

      // Remove the question from the survey
      survey.questions.pull(deletedQuestionId);
    }
  }

  // Save the updated survey
  await survey.save();

  // Return the updated survey with populated data
  return await Survey.findById(surveyId)
    .populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    })
    .populate("categories");
};
const getAllSurveys = async (query = {}) => {
  const { category } = query;
  const filter = {};

  if (category) {
    filter.categories = category;
  }

  return await Survey.find(filter)
    .populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    })
    .populate(["categories"])
    .sort({ createdAt: -1 });
};

const getSurveyById = async (id) => {
  const survey = await Survey.findById(id)
    .populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    })
    .populate(["categories"]);
  if (!survey) throw new Error("Survey not found");
  return survey;
};
const deleteSurvey = async (surveyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const survey = await Survey.findById(surveyId).session(session);
    if (!survey) throw new Error("Survey not found");

    // Delete all associated options for each question
    for (const question of survey.questions) {
      await SurveyQuestionOption.deleteMany(
        {
          _id: { $in: question.options },
        },
        { session }
      );
    }

    // Delete the survey itself
    await Survey.findByIdAndDelete(surveyId, { session });

    await session.commitTransaction();
    return;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Question Management
const addQuestion = async (surveyId, questionData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create options for the new question
    const options = await SurveyQuestionOption.create(
      questionData.options.map((opt) => ({
        content: opt.content,
        color: opt.color,
      })),
      { session }
    );

    const survey = await Survey.findByIdAndUpdate(
      surveyId,
      {
        $push: {
          questions: {
            question: questionData.question,
            options: options.map((opt) => opt._id),
          },
        },
      },
      { new: true, session }
    ).populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });

    if (!survey) {
      throw new Error("Survey not found");
    }

    await session.commitTransaction();
    return survey;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateQuestion = async (surveyId, questionId, questionData) => {
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new Error("Survey not found");

  const question = survey.questions.id(questionId);
  if (!question) throw new Error("Question not found");

  question.question = questionData.question;
  await survey.save();

  return await survey.populate({
    path: "questions.options",
    model: "SurveyQuestionOption",
  });
};

const removeQuestion = async (surveyId, questionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const survey = await Survey.findById(surveyId);
    if (!survey) throw new Error("Survey not found");

    const question = survey.questions.id(questionId);
    if (!question) throw new Error("Question not found");

    // Delete associated options
    await SurveyQuestionOption.deleteMany(
      {
        _id: { $in: question.options },
      },
      { session }
    );

    // Remove question
    survey.questions.pull(questionId);
    await survey.save({ session });

    await session.commitTransaction();

    return await survey.populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Option Management
const addQuestionOption = async (surveyId, questionId, optionData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newOption = await SurveyQuestionOption.create([optionData], {
      session,
    });

    const survey = await Survey.findOneAndUpdate(
      { _id: surveyId, "questions._id": questionId },
      {
        $push: { "questions.$.options": newOption[0]._id },
      },
      { new: true, session }
    ).populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });

    if (!survey) throw new Error("Survey or question not found");

    await session.commitTransaction();
    return survey;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const updateQuestionOption = async (optionId, optionData) => {
  const option = await SurveyQuestionOption.findByIdAndUpdate(
    optionId,
    optionData,
    { new: true }
  );
  if (!option) throw new Error("Option not found");
  return option;
};

const removeQuestionOption = async (surveyId, questionId, optionId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove option reference from question
    const survey = await Survey.findOneAndUpdate(
      { _id: surveyId, "questions._id": questionId },
      {
        $pull: { "questions.$.options": optionId },
      },
      { new: true, session }
    );

    if (!survey) throw new Error("Survey or question not found");

    // Delete the option
    await SurveyQuestionOption.findByIdAndDelete(optionId, { session });

    await session.commitTransaction();

    return await survey.populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Voting

const voteSurvey = async (surveyId, votes, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const survey = await Survey.findById(surveyId).session(session);
    if (!survey) throw new Error("Survey not found");

    if (!isLive(survey.liveStartedAt, survey.liveEndedAt)) {
      throw new Error("The Survey is no longer live");
    }

    // Validate all votes before proceeding
    for (const { questionId, optionId } of votes) {
      const question = survey.questions.id(questionId);
      if (!question) throw new Error(`Question ${questionId} not found`);

      if (!question.options.includes(optionId)) {
        throw new Error(
          `Invalid option ${optionId} for question ${questionId}`
        );
      }

      const existingVote = await SurveyVote.findOne({
        survey: surveyId,
        question: questionId,
        user: userId,
      }).session(session);

      if (existingVote) {
        throw new Error(`User has already voted this survey`);
      }
    }

    // Insert all votes in bulk
    const voteDocuments = votes.map(({ questionId, optionId }) => ({
      survey: surveyId,
      question: questionId,
      option: optionId,
      user: userId,
    }));

    await SurveyVote.insertMany(voteDocuments, { session });

    // Increment voted counts for each selected option
    const optionUpdates = votes.map(({ optionId }) =>
      SurveyQuestionOption.findByIdAndUpdate(
        optionId,
        { $inc: { votedCount: 1 } },
        { session }
      )
    );

    await Promise.all(optionUpdates);

    await session.commitTransaction();
    return { success: true, message: "Votes submitted successfully!" };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const getSurveyResults = async (surveyId) => {
  try {
    // Fetch the survey with populated questions and options
    const survey = await Survey.findById(surveyId).populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });

    if (!survey) {
      throw new Error("Survey not found");
    }

    // Initialize an array to hold graph data for each question
    const graphDataArray = await Promise.all(
      survey.questions.map(async (question) => {
        // Get all votes for this question
        const votes = await SurveyVote.find({
          survey: surveyId,
          question: question._id,
        }).populate("option");

        const startDate = new Date(survey.liveStartedAt);
        const endDate = new Date(survey.liveEndedAt);

        // Set to the first of each month for consistent comparison
        startDate.setDate(1);
        endDate.setDate(endDate.getMonth() + 1, 0);

        // Initialize monthYearVotes object
        const monthYearVotes = {};
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
            options: question.options.reduce((acc, option) => {
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
          const monthYearKey = `${voteDate.getFullYear()}-${String(
            voteDate.getMonth() + 1
          ).padStart(2, "0")}`;

          if (monthYearVotes[monthYearKey]) {
            monthYearVotes[monthYearKey].total++;
            monthYearVotes[monthYearKey].options[vote.option._id.toString()]
              .votes++;
          }
        });

        // Convert monthYearVotes to labels and datasets
        const labels = Object.keys(monthYearVotes)
          .sort()
          .map((key) => {
            const [year, month] = key.split("-");
            return new Date(year, month - 1).toLocaleString("default", {
              month: "short",
              year: "numeric",
            });
          });

        const datasets = question.options.map((option) => {
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

        // Calculate total votes for each option across all months
        const optionTotalVotes = question.options.reduce((acc, option) => {
          acc[option._id.toString()] = votes.filter(
            (vote) => vote.option._id.toString() === option._id.toString()
          ).length;
          return acc;
        }, {});

        // Return the graph data for this question
        return {
          _id: question._id,
          labels,
          datasets,
          totalVotes: votes.length,
          topic: question.question,
          options: question.options.map((option) => {
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
      })
    );

    return graphDataArray;
  } catch (error) {
    throw new Error(`Error fetching survey graph data: ${error.message}`);
  }
};
const getQuestionResults = async (surveyId, questionId, filters) => {
  try {
    // Fetch the survey with the specific question and its options
    const survey = await Survey.findById(surveyId).populate({
      path: "questions",
      match: { _id: questionId },
      populate: { path: "options", model: "SurveyQuestionOption" },
    });

    if (!survey || !survey.questions.length) {
      throw new Error("Survey or question not found");
    }

    const question = survey.questions.find(
      (item) => item._id.toString() === questionId
    );
    const ageRange = filters.age ? filters.age.split("-").map(Number) : null;
    const gender = filters.gender === "null" ? null : filters.gender ?? null;
    const city = filters.city || null;
    const country = filters.country || null;
    const state_province = filters.state_province || null;
    // Prepare the filter query
    let filterQuery = { survey: surveyId, question: questionId };

    // Get all votes for this question with applied filters
    let votes = await SurveyVote.find(filterQuery)
      .populate("option")
      .populate("user");
    votes = votes?.filter((vote) => {
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
    // Determine the date range based on monthDuration
    let startDate, endDate;
    if (filters.monthDuration) {
      // If monthDuration is provided, calculate the start date relative to liveEndedAt
      endDate = new Date(survey.liveEndedAt);
      startDate = new Date(endDate);
      startDate.setMonth(startDate.getMonth() - filters.monthDuration + 1);
    } else {
      // If no monthDuration, use the entire range from survey.createdAt to liveEndedAt
      startDate = new Date(survey.liveStartedAt);
      endDate = new Date(survey.liveEndedAt);
    }

    // Set to the first of each month for consistent comparison
    startDate.setDate(1);
    endDate.setDate(endDate.getMonth() + 1, 0);

    // Initialize monthYearVotes object
    const monthYearVotes = {};

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
        options: question.options.reduce((acc, option) => {
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
          console.log(
            monthYearVotes[monthYearKey].options[vote.option._id.toString()]
          );
          if (
            monthYearVotes[monthYearKey].options[vote.option._id.toString()]
          ) {
            monthYearVotes[monthYearKey].options[vote.option._id.toString()]
              .votes++;
          }
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
        options: question.options.reduce((acc, option) => {
          acc[option._id.toString()] = {
            votes: 0,
            content: option.content,
            color: option.color,
          };
          return acc;
        }, {}),
      };
    }

    // Convert monthYearVotes to labels and datasets
    const labels = Object.keys(monthYearVotes)
      .sort()
      .map((key) => {
        const [year, month] = key.split("-");
        return new Date(year, month - 1).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
      });

    const datasets = question.options.map((option) => {
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

    // Calculate total votes for each option
    const optionTotalVotes = question.options.reduce((acc, option) => {
      acc[option._id.toString()] = votes.filter(
        (vote) => vote.option._id.toString() === option._id.toString()
      ).length;
      return acc;
    }, {});

    // Return the graph data for this question
    return {
      _id: question._id,
      labels,
      datasets,
      totalVotes: votes.length,
      topic: question.question,
      options: question.options.map((option) => {
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
    throw new Error(`Error fetching survey graph data: ${error.message}`);
  }
};
const checkVote = async (surveyId, userId) => {
  try {
    // Get the survey with all questions and their options populated
    const survey = await Survey.findById(surveyId).populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    });

    if (!survey) {
      throw new Error("Survey not found");
    }

    // Get all votes by this user for this survey
    const userVotes = await SurveyVote.find({
      survey: surveyId,
      user: userId,
    }).populate("option");

    // Create a map of question ID to selected option
    const questionVoteMap = {};
    survey.questions.forEach((question) => {
      // Find the vote for this question
      const vote = userVotes.find(
        (v) => v.question.toString() === question._id.toString()
      );
      questionVoteMap[question._id] = vote?.option?._id;
    });

    return questionVoteMap;
  } catch (error) {
    console.error("Error checking votes:", error);
    throw error;
  }
};

module.exports = {
  createSurvey,
  getAllSurveys,
  getSurveyById,
  addQuestion,
  updateQuestion,
  removeQuestion,
  addQuestionOption,
  updateQuestionOption,
  removeQuestionOption,
  voteSurvey,
  getSurveyResults,
  getQuestionResults,
  updateSurvey,
  deleteSurvey,
  checkVote,
};
