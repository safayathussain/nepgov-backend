const EmailTemplate = require("./model");
const EmailCategory = require("../Category/model");

const createEmailTemplate = async (templateData) => {
  const existingTemplate = await EmailTemplate.findOne({ name: templateData.name });
  if (existingTemplate) throw new Error("Template with this name already exists");

  const category = await EmailCategory.findById(templateData.category);
  if (!category) throw new Error("Category not found");

  const template = await EmailTemplate.create(templateData);
  await EmailCategory.findByIdAndUpdate(category._id, { $inc: { templateCount: 1 } });
  return template;
};

const getAllEmailTemplates = async () => {
  return await EmailTemplate.find({}).populate("category");
};

const getEmailTemplateById = async (id) => {
  const template = await EmailTemplate.findById(id).populate("category");
  if (!template) throw new Error("Email template not found");
  return template;
};

const updateEmailTemplate = async (id, updateData) => {
  const template = await EmailTemplate.findById(id);
  if (!template) throw new Error("Email template not found");

  if (updateData.name && updateData.name !== template.name) {
    const existingTemplate = await EmailTemplate.findOne({ name: updateData.name });
    if (existingTemplate) throw new Error("Template with this name already exists");
  }

  if (updateData.category) {
    const category = await EmailCategory.findById(updateData.category);
    if (!category) throw new Error("Category not found");
  }

  const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  ).populate("category");
  return updatedTemplate;
};

const deleteEmailTemplate = async (id) => {
  const template = await EmailTemplate.findById(id);
  if (!template) throw new Error("Email template not found");

  await EmailCategory.findByIdAndUpdate(template.category, { $inc: { templateCount: -1 } });
  await EmailTemplate.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createEmailTemplate,
  getAllEmailTemplates,
  getEmailTemplateById,
  updateEmailTemplate,
  deleteEmailTemplate,
};