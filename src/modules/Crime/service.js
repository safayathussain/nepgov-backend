const {Crime, CrimeType} = require("./model");

const createCrime = async (crimeData) => {
  const crime = await Crime.create(crimeData);
  return;
};

const getAllCrimes = async () => {
  return await Crime.find({}).sort({ createdAt: -1 }).populate("crimeType");
};
const getAllCrimeTypes = async () => {
  return await CrimeType.find({}).sort({ createdAt: -1 });
};

const getCrimeById = async (id) => {
  const crime = await Crime.findById(id).populate("crimeType");
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
const setCrimeTypes = async (types) => {
  // If types is empty or not provided, remove all crime types
  if (!types || !Array.isArray(types) || types.length === 0) {
    // Check if any crime types are used in crimes
    const crimes = await Crime.find({}).populate("crimeType");
    if (crimes.some(crime => crime.crimeType)) {
      throw new Error("Cannot remove crime types that are used in existing crime reports");
    }
    
    await CrimeType.deleteMany({});
    return [];
  }

  // Validate types
  const uniqueTypes = [...new Set(types.filter(type => typeof type === 'string' && type.trim() !== ''))];
  if (uniqueTypes.length === 0) {
    throw new Error("No valid crime types provided");
  }

  // Check if any existing types are used in crimes and not in new types
  const existingTypes = await CrimeType.find({});
  const typesToRemove = existingTypes.filter(
    existing => !uniqueTypes.includes(existing.type)
  );
  
  for (const type of typesToRemove) {
    const crimesUsingType = await Crime.find({ crimeType: type._id });
    if (crimesUsingType.length > 0) {
      throw new Error(`Cannot remove crime type "${type.type}" as it is used in existing crime reports`);
    }
  }

  // Delete all existing types
  await CrimeType.deleteMany({});

  // Create new types
  const newTypes = await CrimeType.insertMany(
    uniqueTypes.map(type => ({ type }))
  );

  return newTypes;
};
module.exports = {
  createCrime,
  getAllCrimes,
  getCrimeById,
  deleteCrime,
  markCrimeAsSeen,
  markAllAsSeen,
  setCrimeTypes,
  getAllCrimeTypes
};
