const jasaotp = require('../services/jasaotp');
const { validateOrder, validateOrderId } = require('../validator');
const logger = require('../logger');

async function createOrder(req, res, next) {
  try {
    const { country, service, operator } = req.body;

    const validationError = validateOrder(country, service, operator);
    if (validationError) {
      return res.status(400).json({
        status: false,
        msg: validationError,
      });
    }

    const result = await jasaotp.createOrder(country, service, operator);
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'createOrder error');
    next(error);
  }
}

async function getOTP(req, res, next) {
  try {
    const { orderId } = req.params;

    const validationError = validateOrderId(orderId);
    if (validationError) {
      return res.status(400).json({
        status: false,
        msg: validationError,
      });
    }

    const result = await jasaotp.getOTP(orderId);
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message, orderId: req.params.orderId }, 'getOTP error');
    next(error);
  }
}

async function cancelOrder(req, res, next) {
  try {
    const { orderId } = req.params;

    const validationError = validateOrderId(orderId);
    if (validationError) {
      return res.status(400).json({
        status: false,
        msg: validationError,
      });
    }

    const result = await jasaotp.cancelOrder(orderId);
    res.json({
      status: true,
      data: result,
    });
  } catch (error) {
    logger.error({ error: error.message, orderId: req.params.orderId }, 'cancelOrder error');
    next(error);
  }
}

module.exports = { createOrder, getOTP, cancelOrder };
