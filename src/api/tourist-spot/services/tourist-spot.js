'use strict';

/**
 * tourist-spot service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::tourist-spot.tourist-spot');
