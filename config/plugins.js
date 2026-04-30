'use strict';

module.exports = ({ env }) => ({
  // Upload plugin configuration - Using Cloudinary for persistent storage
  upload: {
    config: {
      provider: 'cloudinary',
      providerOptions: {
        cloud_name: env('CLOUDINARY_NAME'),
        api_key: env('CLOUDINARY_KEY'),
        api_secret: env('CLOUDINARY_SECRET'),
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
});
