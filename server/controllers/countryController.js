const jasaotp = require('../services/jasaotp');
const logger = require('../logger');

async function getCountries(req, res, next) {
  try {
    const result = await jasaotp.getCountries();
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'getCountries error');
    next(error);
  }
}

module.exports = { getCountries };
