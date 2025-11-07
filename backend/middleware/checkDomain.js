// src/middlewares/checkDomain.js
function checkAllowedDomain(allowedDomainsEnv = process.env.ALLOWED_MS_DOMAINS) {
    const allowed = (allowedDomainsEnv || "")
      .split(",")
      .map(d => d.trim().toLowerCase())
      .filter(Boolean);
  
    return (req, res, next) => {
      const email = (req.body.workEmail || req.body.email || "").toLowerCase();
      const domain = email.split("@")[1];
  
      if (!domain || !allowed.includes(domain)) {
        return res.status(400).json({
          error: true,
          message: `Email domain not allowed. Allowed: ${allowed.join(", ")}`,
        });
      }
      next();
    };
  }
  
  module.exports = checkAllowedDomain;   