const { validationResult } = require("express-validator");
const articleService = require("./service");
const { sendResponse } = require("../../utils/response");

const createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const articleData = {
      ...req.body,
      thumbnail: req.file ? `${req.file.filename}` : null,
      user: req.user, // From auth middleware
    };
    if (!articleData.thumbnail) {
      throw new Error("Thumbnail image is required");
    }
    const result = await articleService.createArticle(articleData);
    sendResponse(res, {
      message: "Article created successfully",
      data: result,
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getAllArticles = async (req, res) => {
  try {
    const articles = await articleService.getAllArticles(req.query);
    sendResponse(res, {
      message: "Articles retrieved successfully",
      data: articles,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const getArticleById = async (req, res) => {
  try {
    const article = await articleService.getArticleById(req.params.id);
    sendResponse(res, {
      message: "Article retrieved successfully",
      data: article,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const updateArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          console.error("Error deleting file:", err);
        }
      }
      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const result = await articleService.updateArticle(
      req.params.id,
      req.adminUser,
      req.body,
      req
    );
    sendResponse(res, {
      message: "Article updated successfully",
      data: result,
    });
  } catch (error) {
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (err) {
        console.error("Error deleting file:", err);
      }
    }
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

const deleteArticle = async (req, res) => {
  try {
    await articleService.deleteArticle(req.params.id, req.adminUser);
    sendResponse(res, {
      message: "Article deleted successfully",
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};
