// services/categoryService.js
const Category = require("./model");

const createCategory = async (categoryData) => {
  const existingCategory = await Category.findOne({ name: categoryData.name });
  if (existingCategory) throw new Error("Category with this name already exists");
  
  const category = await Category.create(categoryData);
  return category;
};

const getAllCategories = async () => {
  return await Category.find({});
};

const getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  return category;
};

const updateCategory = async (id, updateData) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");

  if (updateData.name && updateData.name !== category.name) {
    const existingCategory = await Category.findOne({ name: updateData.name });
    if (existingCategory) throw new Error("Category with this name already exists");
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
  return updatedCategory;
};

const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) throw new Error("Category not found");
  
  await Category.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};