module.exports = (...allowed) => (req, res, next) => {
  if (!req.user.roles.some((r) => allowed.includes(r) || r === 'admin'))
    return res.status(403).json({ msg: 'Privilege not granted' });
  next();
};