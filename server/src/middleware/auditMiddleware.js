const AuditLog = require('../models/AuditLog');

const auditMiddleware = (entityType) => async (req, res, next) => {
  // We only want to log mutations after they finish successfully
  const originalSend = res.send.bind(res);

  res.send = function (data) {
    // Restore original send immediately to avoid infinite recursion
    res.send = originalSend;

    // Log only successful mutations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        try {
          const log = new AuditLog({
            action: req.method,
            entityType: entityType || 'Unknown',
            userId: req.user ? req.user._id : null,
            userRole: req.user ? req.user.role : 'System',
            details: {
              path: req.originalUrl,
              body: req.body,
            }
          });
          log.save().catch(err => console.error('Failed to save audit log:', err));
        } catch (e) {
          console.error('Error in audit middleware:', e);
        }
      }
    }

    return originalSend(data);
  };

  next();
};

module.exports = auditMiddleware;
