const jasaotp = require('../services/jasaotp');
const logger = require('../logger');

async function getBalance(req, res, next) {
  try {
    const result = await jasaotp.getBalance();
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'getBalance error');
    next(error);
  }
}

module.exports = { getBalance };
