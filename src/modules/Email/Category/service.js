const EmailCategory = require("./model");

const createEmailCategory = async (categoryData) => {
  const existingCategory = await EmailCategory.findOne({ name: categoryData.name });
  if (existingCategory) throw new Error("Email category with this name already exists");

  const category = await EmailCategory.create(categoryData);
  return category;
};

const getAllEmailCategories = async () => {
  return await EmailCategory.find({});
};

const getEmailCategoryById = async (id) => {
  const category = await EmailCategory.findById(id);
  if (!category) throw new Error("Email category not found");
  return category;
};

const updateEmailCategory = async (id, updateData) => {
  const category = await EmailCategory.findById(id);
  if (!category) throw new Error("Email category not found");

  if (updateData.name && updateData.name !== category.name) {
    const existingCategory = await EmailCategory.findOne({ name: updateData.name });
    if (existingCategory) throw new Error("Email category with this name already exists");
  }

  const updatedCategory = await EmailCategory.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
  return updatedCategory;
};

const deleteEmailCategory = async (id) => {
  const category = await EmailCategory.findById(id);
  if (!category) throw new Error("Email category not found");

  await EmailCategory.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createEmailCategory,
  getAllEmailCategories,
  getEmailCategoryById,
  updateEmailCategory,
  deleteEmailCategory,
};