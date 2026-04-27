'use strict';

module.exports = ({ env }) => ({
  // Upload plugin configuration - FIX FILE UPLOADS
  upload: {
    config: {
      provider: 'local',
      actionOptions: {
        upload: {
          // Increase file size limits to fix upload errors
          maxFileSize: 100 * 1024 * 1024, // 100MB
        },
        uploadStream: {
          maxFileSize: 100 * 1024 * 1024, // 100MB
        },
      },
    },
  },
});
