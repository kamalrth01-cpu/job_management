require('dotenv').config();
console.log('CLOUDINARY_CLOUD_NAME:', typeof process.env.CLOUDINARY_CLOUD_NAME !== 'undefined' ? 'Defined' : 'Undefined');
console.log('CLOUDINARY_API_KEY:', typeof process.env.CLOUDINARY_API_KEY !== 'undefined' ? 'Defined' : 'Undefined');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Defined' : 'Undefined');
