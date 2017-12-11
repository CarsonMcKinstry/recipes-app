import s3Config from "../config/s3";
import multer from "multer";
import multerS3 from "multer-s3";
import AWS from "aws-sdk";
import uuidV4 from "uuid/v4";
import { extname } from "path";

AWS.config.update(s3Config);
const s3 = new AWS.S3();
const acceptedMimeTypes = new RegExp(/(image\/).+/, "g");

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    metadata: (req, file, cb) =>
      cb(null, {
        fieldName: file.fieldname
      }),
    acl: "public-read",
    key: (req, file, cb) => cb(null, `${uuidV4()}${extname(file.originalname)}`)
  }),
  fileFilter: (req, file, cb) =>
    acceptedMimeTypes.test(file.mimetype) ? cb(null, true) : cb(null, false)
});
