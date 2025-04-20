const { User } = require("./model");

const getAllUsers = async () => {
  return await User.find();
};
const deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error("User not found");
  }
};

const getUserById = async (id) => {
  return await User.findById(id).populate("survey");
};
module.exports = { getAllUsers, getUserById, deleteUser };
