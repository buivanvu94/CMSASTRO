# Security Guidelines

## Overview

This document outlines the security measures implemented in the CMS system and best practices for maintaining security.

## Implemented Security Measures

### 1. Authentication & Authorization

#### Password Security
- ✅ Passwords hashed using bcrypt with salt rounds >= 10
- ✅ Password validation (minimum length, complexity)
- ✅ No password storage in plain text
- ✅ Password change requires current password verification

#### JWT Tokens
- ✅ Access tokens with short expiration (15 minutes)
- ✅ Refresh tokens with longer expiration (7 days)
- ✅ Token verification on protected routes
- ✅ Token invalidation on logout

#### Role-Based Access Control (RBAC)
- ✅ Three roles: admin, editor, author
- ✅ Route-level authorization
- ✅ Resource ownership checking
- ✅ Granular permissions per role

### 2. Input Validation & Sanitization

#### Request Validation
- ✅ express-validator for all inputs
- ✅ Type checking and format validation
- ✅ SQL injection prevention via Sequelize ORM
- ✅ XSS prevention via input sanitization

#### File Upload Security
- ✅ File type validation (MIME type checking)
- ✅ File size limits (10MB max)
- ✅ Unique filename generation
- ✅ Secure file storage outside web root

### 3. Rate Limiting

#### Authentication Endpoints
- ✅ 5 attempts per 15 minutes per IP
- ✅ Automatic lockout after limit
- ✅ Skip successful requests

#### API Endpoints
- ✅ 100 requests per 15 minutes per IP
- ✅ Configurable per endpoint

#### Sensitive Operations
- ✅ 10 requests per hour for critical operations
- ✅ Password reset, account deletion, etc.

### 4. HTTP Security Headers

#### Helmet.js Configuration
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options (clickjacking protection)
- ✅ X-Content-Type-Options (MIME sniffing protection)
- ✅ Strict-Transport-Security (HTTPS enforcement)
- ✅ X-XSS-Protection

### 5. CORS Configuration

- ✅ Whitelist of allowed origins
- ✅ Credentials support
- ✅ Preflight request handling
- ✅ Configurable per environment

### 6. Database Security

- ✅ Parameterized queries (Sequelize)
- ✅ Connection pooling
- ✅ Encrypted connections (production)
- ✅ Database indexes for performance

### 7. Error Handling

- ✅ No sensitive data in error messages
- ✅ Generic error messages for clients
- ✅ Detailed logging for debugging
- ✅ Stack traces only in development

## Security Checklist

### Before Deployment

#### Environment Variables
- [ ] Change JWT_SECRET to strong random string (min 32 characters)
- [ ] Change JWT_REFRESH_SECRET to different strong random string
- [ ] Set NODE_ENV=production
- [ ] Use strong database password
- [ ] Configure CORS_ORIGIN to specific domains

#### Database
- [ ] Run database migrations
- [ ] Add database indexes (run `node src/migrations/add-indexes.js`)
- [ ] Enable SSL/TLS for database connections
- [ ] Restrict database access to application server only
- [ ] Regular database backups

#### Application
- [ ] Update all dependencies to latest secure versions
- [ ] Run security audit: `npm audit`
- [ ] Fix all high/critical vulnerabilities
- [ ] Enable rate limiting on all routes
- [ ] Configure proper CORS origins
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)

#### Server
- [ ] Use HTTPS/TLS certificates
- [ ] Configure firewall rules
- [ ] Disable unnecessary services
- [ ] Keep OS and software updated
- [ ] Configure log rotation
- [ ] Set up monitoring and alerts

### Regular Maintenance

#### Weekly
- [ ] Review application logs for suspicious activity
- [ ] Check for failed login attempts
- [ ] Monitor API rate limit hits

#### Monthly
- [ ] Run `npm audit` and update dependencies
- [ ] Review user accounts and permissions
- [ ] Check database performance
- [ ] Review and rotate API keys if applicable

#### Quarterly
- [ ] Security audit of codebase
- [ ] Penetration testing
- [ ] Review and update security policies
- [ ] Backup and disaster recovery testing

## Environment Variables Security

### Required Secure Configuration

```env
# Production values - CHANGE THESE!
NODE_ENV=production
PORT=3000

# Database - Use strong password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cms_db
DB_USER=cms_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# JWT - Use strong random strings (min 32 chars)
JWT_SECRET=<GENERATE_STRONG_SECRET>
JWT_REFRESH_SECRET=<GENERATE_DIFFERENT_STRONG_SECRET>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS - Specify exact origins
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

### Generating Secure Secrets

```bash
# Generate random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate random secret (OpenSSL)
openssl rand -hex 32
```

## Common Vulnerabilities & Mitigations

### 1. SQL Injection
**Mitigation**: Using Sequelize ORM with parameterized queries
```javascript
// ✅ Safe
User.findOne({ where: { email: userInput } });

// ❌ Unsafe
sequelize.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

### 2. XSS (Cross-Site Scripting)
**Mitigation**: Input validation and output encoding
```javascript
// ✅ Safe - validated input
body('content').trim().escape()

// ❌ Unsafe - raw HTML rendering
res.send(`<div>${userInput}</div>`);
```

### 3. CSRF (Cross-Site Request Forgery)
**Mitigation**: 
- SameSite cookie attribute
- CORS configuration
- Token-based authentication (JWT)

### 4. Brute Force Attacks
**Mitigation**: Rate limiting on authentication endpoints
```javascript
// Applied to /auth/login
authLimiter: 5 attempts per 15 minutes
```

### 5. Insecure Direct Object References (IDOR)
**Mitigation**: Authorization checks
```javascript
// ✅ Check ownership
if (post.author_id !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Forbidden' });
}
```

### 6. Sensitive Data Exposure
**Mitigation**: 
- Password hashing
- No sensitive data in logs
- HTTPS only in production
- Secure headers

### 7. Broken Authentication
**Mitigation**:
- Strong password requirements
- JWT with expiration
- Token refresh mechanism
- Logout functionality

## Incident Response

### If Security Breach Detected

1. **Immediate Actions**
   - Isolate affected systems
   - Change all passwords and secrets
   - Revoke all active tokens
   - Enable maintenance mode

2. **Investigation**
   - Review logs for attack vector
   - Identify compromised data
   - Document timeline of events

3. **Remediation**
   - Patch vulnerabilities
   - Update security measures
   - Restore from clean backup if needed

4. **Communication**
   - Notify affected users
   - Report to authorities if required
   - Document lessons learned

## Security Contacts

- Security Issues: security@yourdomain.com
- Emergency: +1-XXX-XXX-XXXX

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Sequelize Security](https://sequelize.org/docs/v6/other-topics/security/)

## Compliance

### GDPR Considerations
- User data encryption
- Right to be forgotten (user deletion)
- Data export functionality
- Privacy policy
- Cookie consent

### Data Retention
- User data: Retained until account deletion
- Logs: 90 days
- Backups: 30 days
- Audit trails: 1 year

---

**Last Updated**: 2024
**Version**: 1.0
