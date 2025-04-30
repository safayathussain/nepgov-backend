const { S3Client } = require("@aws-sdk/client-s3"); 
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path"); 
const { folders } = require("./constants");

const s3 = new S3Client({
  region: process.env.DIGITAL_OCEAN_REGION, 
  endpoint: process.env.DIGITAL_OCEAN_ENDPOINT,
  credentials: {
    accessKeyId: process.env.DIGITAL_OCEAN_ACCESS_KEY_ID,
    secretAccessKey: process.env.DIGITAL_OCEAN_SECRET_ACCESS_KEY,
    
  },

  forcePathStyle: false,
});
const storage = multerS3({
  s3,
  bucket: process.env.DIGITAL_OCEAN_BUCKET_NAME,
  acl: "public-read",
  key: (req, file, cb) => {
    const folderName = req.folderName;
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${folderName || folders.others}/${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, jpeg, png, gif) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
