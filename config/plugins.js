'use strict';

module.exports = ({ env }) => {
  const cloudinaryName = env('CLOUDINARY_NAME');
  const cloudinaryKey = env('CLOUDINARY_KEY');
  const cloudinarySecret = env('CLOUDINARY_SECRET');

  if (!cloudinaryName || !cloudinaryKey || !cloudinarySecret) {
    console.warn('⚠️  Cloudinary credentials not configured. Set CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET');
  }

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: cloudinaryName,
          api_key: cloudinaryKey,
          api_secret: cloudinarySecret,
          timeout: 600000, // 10 minutes — needed for large panoramic uploads on Render free tier
        },
        actionOptions: {
          upload: {},
          uploadStream: {},
          delete: {},
        },
      },
    },
  };
};
