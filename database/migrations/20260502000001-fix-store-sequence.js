'use strict';

/**
 * Reset the strapi_core_store_settings primary-key sequence so it is
 * always ahead of the highest existing id. Without this, repeated
 * deploys that add new content types can hit a duplicate-pkey error
 * because PostgreSQL's sequence falls behind the rows already in the
 * table (e.g. after a restore or partial startup crash).
 */
module.exports = {
  async up(knex) {
    const client = knex.client?.config?.client ?? '';
    if (!client.includes('postgres')) return;

    await knex.raw(`
      SELECT setval(
        pg_get_serial_sequence('strapi_core_store_settings', 'id'),
        GREATEST(COALESCE((SELECT MAX(id) FROM strapi_core_store_settings), 0), 1),
        true
      )
    `);
  },

  async down() {},
};
