const Article = require("./model");
const Category = require("../Category/model")
const createArticle = async (articleData) => {
  // Verify all categories exist
  const categoryIds = articleData.categories;
  const validCategories = await Category.find({ _id: { $in: categoryIds } });
  if (validCategories.length !== categoryIds.length) {
    throw new Error("One or more categories are invalid");
  }
  
  const article = await Article.create(articleData);
  
  // Update article count in categories
  await Category.updateMany(
    { _id: { $in: categoryIds } },
    { $inc: { articleCount: 1 } }
  );
  
  return await Article.findById(article._id)
    .populate('categories', 'name')
    .populate('user', 'name email');
};

const getAllArticles = async (query = {}) => {
  const { category, search, count } = query; 

  let filter = {};

  if (category) {
    filter.categories = category;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } }
    ];
  }

  let queryBuilder = Article.find(filter)
    .populate("categories", "name")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  if (count) {
    queryBuilder = queryBuilder.limit(parseInt(count, 10));
  }

  return await queryBuilder;
};



const getArticleById = async (id) => {
  const article = await Article.findById(id)
    .populate('categories', 'name')
    .populate('user', 'name email');
    
  if (!article) throw new Error("Article not found");
  return article;
};

const updateArticle = async (id, userId, updateData, req) => {
  const article = await Article.findById(id);
  if (!article) throw new Error("Article not found");
   
  
  if (updateData.categories) {
    // Verify new categories exist
    const validCategories = await Category.find({ _id: { $in: updateData.categories } });
    if (validCategories.length !== updateData.categories.length) {
      throw new Error("One or more categories are invalid");
    }
    
    // Update article counts
    await Category.updateMany(
      { _id: { $in: article.categories } },
      { $inc: { articleCount: -1 } }
    );
    await Category.updateMany(
      { _id: { $in: updateData.categories } },
      { $inc: { articleCount: 1 } }
    );
  }
  if (req.file) {
    updateData.thumbnail = `${req.file.filename}`;
  }
  const updatedArticle = await Article.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  )
  .populate('categories', 'name')
  .populate('user', 'name email');
  
  return updatedArticle;
};

const deleteArticle = async (id, userId) => {
  const article = await Article.findById(id);
  if (!article) throw new Error("Article not found");
  
  
  
  // Update article counts in categories
  await Category.updateMany(
    { _id: { $in: article.categories } },
    { $inc: { articleCount: -1 } }
  );
  
  await Article.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
};