const multiparty = require("multiparty");
const cloudinary = require("cloudinary").v2;
const { v4: uuidv4 } = require('uuid');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to handle file uploads with Cloudinary
const uploadForFilesOnly = (req, res, next) => {
  const form = new multiparty.Form({
    maxFilesSize: 5 * 1024 * 1024, // Max file size (5MB)
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return next(new Error("File upload error: " + err.message));
    }

    const processedFiles = [];

    try {
      // Process each file in the 'files' object
      for (const key of Object.keys(files)) {
        const fileArray = files[key];

        for (const uploadedFile of fileArray) {
          const fileTypes = /jpeg|jpg|png/;
          const extname = uploadedFile.originalFilename.match(/\.[0-9a-z]+$/i)[0]?.toLowerCase();
          const mimetype = fileTypes.test(uploadedFile.headers["content-type"]);

          if (fileTypes.test(extname) && mimetype) {
            const uniqueName = `${Date.now()}-${uuidv4()}`;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(uploadedFile.path, {
              folder: "uploads",
              public_id: uniqueName,
              resource_type: "image",
              context: { original_filename: uploadedFile.originalFilename }
            });

            processedFiles.push({
              fieldName: uploadedFile.fieldName,
              originalName: uploadedFile.originalFilename,
              savedName: uniqueName,
              path: result.secure_url, // Cloudinary URL
              public_id: result.public_id // Cloudinary public_id
            });
          }
        }
      }

      if (processedFiles.length === 0) {
        return next(new Error("No valid files uploaded"));
      }

      req.files = processedFiles;
      next();
    } catch (error) {
      return next(new Error("Error uploading to Cloudinary: " + error.message));
    }
  });
};

module.exports = { uploadForFilesOnly };