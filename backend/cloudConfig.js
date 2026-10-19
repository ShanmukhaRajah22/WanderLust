import cloudinaryPackage from "cloudinary";
import CloudinaryStorage from "multer-storage-cloudinary";

cloudinaryPackage.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryPackage,
    params: {
        folder: 'wanderlust_Dev',
        allowedFormats: ['png', 'jpg', 'jpeg'],
    },
});

export const cloudinary = cloudinaryPackage.v2;
export { storage };