'use strict';

module.exports = {
  async register({ strapi }) {
    // Reset PostgreSQL sequence on strapi_core_store_settings to avoid
    // duplicate pkey errors when new content types are added on deploy.
    try {
      const db = strapi.db?.connection;
      if (db) {
        await db.raw(`
          SELECT setval(
            pg_get_serial_sequence('strapi_core_store_settings', 'id'),
            GREATEST(COALESCE((SELECT MAX(id) FROM strapi_core_store_settings), 0), 1),
            true
          )
        `);
      }
    } catch (_) {
      // Non-postgres env or table doesn't exist yet — safe to ignore
    }
  },

  bootstrap() {},
};
