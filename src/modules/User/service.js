const {User} = require("./model");

const getAllUsers = async () => {
  return await User.find();
};
const getUserById = async (id) => {
  return await User.findById(id).populate("survey");
};
module.exports = {getAllUsers, getUserById}