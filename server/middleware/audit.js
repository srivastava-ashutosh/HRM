const Audit = require('../models/Audit');

const auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        const entry = {
          user: req.user._id,
          username: req.user.username,
          action,
          resource: typeof resource === 'function' ? resource(req) : resource,
          resourceId: req.params.id || body?._id,
          description: `${action} ${typeof resource === 'function' ? resource(req) : resource}`,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        };
        if (req.method === 'PUT' && req.body) {
          entry.diff = { before: null, after: req.body };
        }
        Audit.create(entry).catch(() => {});
      }
      return originalJson(body);
    };
    next();
  };
};

module.exports = { auditLog };
