const StaticPage = require("./model");

const createStaticPage = async (pageData) => {
  const existingPage = await StaticPage.findOne({ page: pageData.page });
  if (existingPage) throw new Error("Static page with this type already exists");
  
  const page = await StaticPage.create(pageData);
  return page;
};

const getAllStaticPages = async () => {
  return await StaticPage.find({});
};

const getStaticPageById = async (id) => {
  const page = await StaticPage.findById(id);
  if (!page) throw new Error("Static page not found");
  return page;
};

const getStaticPageByType = async (pageType) => {
  const page = await StaticPage.findOne({ page: pageType });
  if (!page) throw new Error("Static page not found");
  return page;
};

const updateStaticPage = async (id, updateData) => {
  const page = await StaticPage.findById(id);
  if (!page) throw new Error("Static page not found");

  if (updateData.page && updateData.page !== page.page) {
    const existingPage = await StaticPage.findOne({ page: updateData.page });
    if (existingPage) throw new Error("Static page with this type already exists");
  }

  const updatedPage = await StaticPage.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
  return updatedPage;
};

const deleteStaticPage = async (id) => {
  const page = await StaticPage.findById(id);
  if (!page) throw new Error("Static page not found");
  
  await StaticPage.findByIdAndDelete(id);
  return true;
};

module.exports = {
  createStaticPage,
  getAllStaticPages,
  getStaticPageById,
  getStaticPageByType,
  updateStaticPage,
  deleteStaticPage,
};