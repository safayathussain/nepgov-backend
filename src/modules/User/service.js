const User = require("./model");

const getAllUsers = async () => {
  return await User.find();
};
module.exports = {getAllUsers}