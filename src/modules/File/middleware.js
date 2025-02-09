const multiparty = require("multiparty");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');

// Function to handle file uploads
const uploadForFilesOnly = (req, res, next) => {
  const form = new multiparty.Form({
    uploadDir: "./uploads", // Directory to store uploaded files
    maxFilesSize: 5 * 1024 * 1024, // Max file size (5MB)
  });
  // Parse the form data
  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(new Error("File upload error: " + err.message));
    }

    const processedFiles = [];

    // Process each file in the 'files' object
    Object.keys(files).forEach((key) => {
      const fileArray = files[key]; // Array of files under the current key

      fileArray.forEach((uploadedFile) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = path.extname(uploadedFile.originalFilename).toLowerCase();
        const mimetype = fileTypes.test(uploadedFile.headers["content-type"]);

        if (fileTypes.test(extname) && mimetype) {
          const fileExtension = extname; // Ensure the extension is added to the new filename
          const newFileName = `${Date.now()}-${uuidv4()}${fileExtension}`;
          const newFilePath = path.join("./uploads", newFileName);

          try {
            fs.renameSync(uploadedFile.path, newFilePath); // Synchronous to ensure order
            processedFiles.push({
              fieldName: uploadedFile.fieldName,
              originalName: uploadedFile.originalFilename,
              savedName: newFileName,
              path: newFilePath,
            });
          } catch (err) {
            return next(new Error("Error saving file: " + err.message));
          }
        } else {
          // Remove invalid file
          fs.unlink(uploadedFile.path, () => {}); // Silently handle deletion of invalid files
        }
      });
    });

    if (processedFiles.length === 0) {
      return next(new Error("No valid files uploaded"));
    }

    req.files = processedFiles; // Attach processed files to the request
    console.log(req.files);
    next();
  });
};

module.exports = { uploadForFilesOnly };
