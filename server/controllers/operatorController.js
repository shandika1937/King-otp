const jasaotp = require('../services/jasaotp');
const { validateCountry } = require('../validator');
const logger = require('../logger');

async function getOperators(req, res, next) {
  try {
    const { country } = req.query;

    const validationError = validateCountry(country);
    if (validationError) {
      return res.status(400).json({
        status: false,
        msg: validationError,
      });
    }

    const result = await jasaotp.getOperators(country);
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message, country: req.query.country }, 'getOperators error');
    next(error);
  }
}

module.exports = { getOperators };
