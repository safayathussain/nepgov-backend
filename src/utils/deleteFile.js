const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// Configure DigitalOcean Spaces (S3-compatible)
const s3Client = new S3Client({
  endpoint: process.env.DIGITAL_OCEAN_ENDPOINT, // e.g., https://nyc3.digitaloceanspaces.com
  region: process.env.DIGITAL_OCEAN_REGION, // e.g., nyc3
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DIGITAL_OCEAN_SECRET_ACCESS_KEY,
  },
});

// Function to delete a file from DigitalOcean Spaces
const deleteFile = async (fileKey) => {
  try {
    const params = {
      Bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME, // Your Space name
      Key: fileKey, // The key of the file to delete (e.g., uploads/filename.jpg)
    };

    // Send the delete command
    await s3Client.send(new DeleteObjectCommand(params));
    return { success: true, message: `File ${fileKey} deleted successfully` };
  } catch (error) {
    throw new Error(`Error deleting file from DigitalOcean Spaces: ${error.message}`);
  }
};

module.exports = { deleteFile };