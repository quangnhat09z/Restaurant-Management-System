function validationMiddleware(validator) {
  return (req, res, next) => {
    console.log('[validator] path=', req.path);
    console.log('[validator] body keys=', Object.keys(req.body || {}));
    const { error } = validator(req.body);
    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ error: 'Invalid input', details });
    }
    next();
  };
}

module.exports = { validationMiddleware };
