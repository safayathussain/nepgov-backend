const accessTokenDuration = 60 * 60 * 1000; //5 minute
const refreshTokenDuration = 2 * 30 * 24 * 60 * 60 * 1000; //2 month

const folders = {
  surveys: "surveys",
  profilePictures: "profile-picture",
  articles: "articles",
  others: "others"
}
module.exports = {
  folders,
  accessTokenDuration,
  refreshTokenDuration,
};
