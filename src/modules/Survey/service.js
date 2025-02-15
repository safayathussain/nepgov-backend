const { Survey, SurveyVote, SurveyQuestionOption } = require("./model");
const mongoose = require("mongoose");

// Survey CRUD
const createSurvey = async (surveyData) => {
  console.log(surveyData);
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
  const { updatedQuestions, deletedQuestions, topic, categories, thumbnail } =
    updateData;
  const survey = await Survey.findById(surveyId);
  if (!survey) throw new Error("Survey not found");

  if (topic) survey.topic = topic;
  if (categories) survey.categories = categories;
  if (thumbnail) survey.thumbnail = thumbnail;
  if (updatedQuestions && updatedQuestions.length > 0) {
    for (const questionData of updatedQuestions) {
      let question;
      if (questionData._id) {
        // Update existing question
        question = survey.questions.id(questionData._id);
        if (!question)
          throw new Error(`Question with ID ${questionData._id} not found`);

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
            const updatedOption = await SurveyQuestionOption.findByIdAndUpdate(
              option._id,
              { content: option.content, color: option.color },
              { new: true }
            );
            if (!updatedOption)
              throw new Error(`Option with ID ${option._id} not found`);
          } else {
            // Create new option
            const newOption = new SurveyQuestionOption({
              content: option.content,
              color: option.color,
            });
            await newOption.save();
            question.options.push(newOption._id);
            const lastQuestion = survey.questions[survey.questions.length - 1];
            lastQuestion.options.push(newOption._id); // Link the new option to the question
          }
        }
      }
      survey.questions = survey.questions.map(
        (q) => {
          console.log(q._id, question._id);
          return q;
        }

        // q._id === question._id  ? question : q
      );

      // Handle deleted options
      if (
        questionData.deletedOptions &&
        questionData.deletedOptions.length > 0
      ) {
        for (const deletedOptionId of questionData.deletedOptions) {
          const optionToDelete = await SurveyQuestionOption.findByIdAndDelete(
            deletedOptionId
          );
          if (!optionToDelete)
            throw new Error(`Option with ID ${deletedOptionId} not found`);

          // Remove the deleted option from the question's options array
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

  return await Survey.findById(surveyId)
    .populate({
      path: "questions.options",
      model: "SurveyQuestionOption",
    })
    .populate("categories");
};
const getAllSurveys = async (query = {}) => {
  const { categories } = query;
  const filter = {};

  if (categories) {
    const categoryIds = categories
      .split(",")
      .map((category) => mongoose.Types.ObjectId(category));
    filter.categories = { $in: categoryIds };
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
const voteSurvey = async (surveyId, questionId, optionId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`Transaction started with session: ${session.id}`);

    const survey = await Survey.findById(surveyId).session(session);
    if (!survey) throw new Error("Survey not found");

    if (!survey.isLive || survey.liveEndedAt < new Date()) {
      throw new Error("Survey is not active");
    }

    const question = survey.questions.id(questionId);
    if (!question) throw new Error("Question not found");

    console.log(`Option ID: ${optionId}`);
    if (!question.options.includes(optionId)) {
      throw new Error("Invalid option for this question");
    }

    const existingVote = await SurveyVote.findOne({
      survey: surveyId,
      question: questionId,
      user: userId,
    }).session(session);

    if (existingVote) {
      throw new Error("User has already voted for this question");
    }

    await SurveyVote.create(
      [
        {
          survey: surveyId,
          question: questionId,
          option: optionId,
          user: userId,
        },
      ],
      { session }
    );

    await SurveyQuestionOption.findByIdAndUpdate(
      optionId,
      { $inc: { votedCount: 1 } },
      { session }
    );

    await session.commitTransaction();
    console.log(
      `Transaction committed successfully for session: ${session.id}`
    );
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
    console.log(`Session ended: ${session.id}`);
  }
};

const getSurveyResults = async (surveyId) => {
  const survey = await Survey.findById(surveyId).populate({
    path: "questions.options",
    model: "SurveyQuestionOption",
  });

  if (!survey) throw new Error("Survey not found");

  const results = await Promise.all(
    survey.questions.map(async (question) => {
      const votes = await SurveyVote.find({
        survey: surveyId,
        question: question._id,
      }).countDocuments();

      const optionsWithStats = question.options.map((option) => ({
        _id: option._id,
        content: option.content,
        color: option.color,
        votes: option.votedCount,
        percentage:
          votes > 0 ? ((option.votedCount / votes) * 100).toFixed(2) : 0,
      }));

      return {
        _id: question._id,
        question: question.question,
        options: optionsWithStats,
        totalVotes: votes,
      };
    })
  );

  return results;
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
  updateSurvey,
  deleteSurvey,
};
