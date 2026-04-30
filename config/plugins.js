'use strict';

module.exports = ({ env }) => {
  // Validate Cloudinary credentials are present
  const cloudinaryName = env('CLOUDINARY_NAME');
  const cloudinaryKey = env('CLOUDINARY_KEY');
  const cloudinarySecret = env('CLOUDINARY_SECRET');

  if (!cloudinaryName || !cloudinaryKey || !cloudinarySecret) {
    console.warn('⚠️  Cloudinary credentials not configured. Uploads will fail. Set CLOUDINARY_NAME, CLOUDINARY_KEY, CLOUDINARY_SECRET');
  }

  return {
    upload: {
      config: {
        provider: 'cloudinary',
        providerOptions: {
          cloud_name: cloudinaryName,
          api_key: cloudinaryKey,
          api_secret: cloudinarySecret,
        },
        actionOptions: {
          upload: {
            maxFileSize: 100 * 1024 * 1024, // 100MB
          },
          uploadStream: {
            maxFileSize: 100 * 1024 * 1024, // 100MB
          },
        },
      },
    },
  };
};
