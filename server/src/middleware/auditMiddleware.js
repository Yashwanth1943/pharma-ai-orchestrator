const AuditLog = require('../models/AuditLog');

const auditMiddleware = (entityType) => async (req, res, next) => {
  // We only want to log mutations after they finish successfully
  const originalSend = res.send;
  
  res.send = function (data) {
    res.send = originalSend;
    
    // Check if it's a successful mutation
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        try {
          const log = new AuditLog({
            action: req.method,
            entityType: entityType || 'Unknown',
            userId: req.user ? req.user.id : null,
            userRole: req.user ? req.user.role : 'System',
            details: {
              path: req.originalUrl,
              body: req.body,
              // If the response is a JSON object with an ID, we could extract entityId
              // This is a basic implementation for the demo
            }
          });
          log.save().catch(err => console.error("Failed to save audit log:", err));
        } catch(e) {
          console.error("Error in audit middleware:", e);
        }
      }
    }
    
    return res.send(data);
  };
  
  next();
};

module.exports = auditMiddleware;
