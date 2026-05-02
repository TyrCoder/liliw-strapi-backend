'use strict';

module.exports = {
  async find(ctx) {
    const docs = await strapi.documents('api::booking.booking').findMany({});
    ctx.body = { data: docs };
  },
  async findOne(ctx) {
    const doc = await strapi.documents('api::booking.booking').findOne({ documentId: ctx.params.id });
    ctx.body = { data: doc };
  },
  async create(ctx) {
    const { data } = ctx.request.body;
    const doc = await strapi.documents('api::booking.booking').create({ data });
    ctx.status = 201;
    ctx.body = { data: doc };
  },
  async update(ctx) {
    const { data } = ctx.request.body;
    const doc = await strapi.documents('api::booking.booking').update({ documentId: ctx.params.id, data });
    ctx.body = { data: doc };
  },
  async delete(ctx) {
    await strapi.documents('api::booking.booking').delete({ documentId: ctx.params.id });
    ctx.status = 204;
    ctx.body = null;
  },
};
