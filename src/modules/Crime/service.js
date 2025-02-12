const Crime = require("./model");

const createCrime = async (crimeData) => {
  const crime = await Crime.create(crimeData);
  return;
};

const getAllCrimes = async () => {
  return await Crime.find({}).sort({ createdAt: -1 });
};

const getCrimeById = async (id) => {
  const crime = await Crime.findById(id).populate(["user"]);

  if (!crime) throw new Error("Crime report not found");
  return crime;
};

const deleteCrime = async (id) => {
  const crime = await Crime.findById(id);
  if (!crime) throw new Error("Crime report not found");
  
  await Crime.findByIdAndDelete(id);
  return true;
};

const markCrimeAsSeen = async (id) => {
  const crime = await Crime.findById(id);
  if (!crime) throw new Error("Crime report not found");

  crime.isSeenByAdmin = true;
  await crime.save();
  return crime;
};

const markAllAsSeen = async () => {
  await Crime.updateMany(
    { isSeenByAdmin: false },
    { $set: { isSeenByAdmin: true } }
  );
  return true;
};

module.exports = {
  createCrime,
  getAllCrimes,
  getCrimeById,
  deleteCrime,
  markCrimeAsSeen,
  markAllAsSeen
};
