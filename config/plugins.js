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
      // Security configuration for file uploads
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64,
      },
      formats: ['image/webp', 'image/jpeg', 'image/png'],
      responsiveDimensions: true,
    },
  },
});
