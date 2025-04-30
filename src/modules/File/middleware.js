const multiparty = require("multiparty");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const { folders } = require("../../utils/constants");
 
const s3Client = new S3Client({
  region: process.env.DIGITAL_OCEAN_REGION, 
  endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,  
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DIGITAL_OCEAN_SECRET_ACCESS_KEY,
  },
});
 
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
      for (const key of Object.keys(files)) {
        const fileArray = files[key];

        for (const uploadedFile of fileArray) {
          const fileTypes = /jpeg|jpg|png/;
          const extname = uploadedFile.originalFilename
            .match(/\.[0-9a-z]+$/i)[0]
            ?.toLowerCase();
          const mimetype = fileTypes.test(uploadedFile.headers["content-type"]);

          if (fileTypes.test(extname) && mimetype) {
            const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname}`;
            const fileBuffer = require("fs").readFileSync(uploadedFile.path);

            // Upload to DigitalOcean Spaces
            const params = {
              Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,  
              Key: `${folders.others}/${uniqueName}`, 
              Body: fileBuffer,
              ACL: "public-read",  
              ContentType: uploadedFile.headers["content-type"],
              Metadata: {
                original_filename: uploadedFile.originalFilename,
              },
            };

            await s3Client.send(new PutObjectCommand(params));

            const fileUrl = `${process.env.DIGITAL_OCEAN_ENDPOINT}/${process.env.DIGITAL_OCEAN_BUCKET_NAME}/${folders.others}/${uniqueName}`;

            processedFiles.push({
              fieldName: uploadedFile.fieldName,
              originalName: uploadedFile.originalFilename,
              savedName: uniqueName,
              path: fileUrl, // DigitalOcean Spaces URL
              key: `${folders.others}/${uniqueName}`, // S3 key
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
      return next(new Error("Error uploading to DigitalOcean Spaces: " + error.message));
    }
  });
};

module.exports = { uploadForFilesOnly };