const setFolderName = (folderName) => {
  return (req, res, next) => {
    req.folderName = folderName;
    next();
  };
};
module.exports = {
  setFolderName,
};
