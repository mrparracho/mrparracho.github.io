# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **DO NOT** create a public GitHub issue
Security vulnerabilities should not be disclosed publicly.

### 2. **DO** report privately
Email security details to: [your-email@example.com](mailto:your-email@example.com)

### 3. **Include** the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 4. **Response timeline**
- **Initial response**: Within 48 hours
- **Status update**: Within 1 week
- **Resolution**: As soon as possible

## Security Best Practices

### For Users
- **Never commit API keys** to the repository
- **Use GitHub Secrets** for sensitive configuration
- **Keep dependencies updated** regularly
- **Review code changes** before deployment

### For Contributors
- **Follow secure coding practices**
- **Validate all inputs** thoroughly
- **Use environment variables** for secrets
- **Test security measures** in your changes

## Security Features

This template includes several security measures:

- ✅ **No hardcoded secrets** in repository
- ✅ **Environment-based configuration** via GitHub Secrets
- ✅ **Secure API key injection** during build time
- ✅ **CORS protection** for backend APIs
- ✅ **Input validation** in all forms
- ✅ **HTTPS enforcement** on GitHub Pages

## Reporting Security Issues

If you find a security vulnerability:

1. **Email**: [your-email@example.com](mailto:your-email@example.com)
2. **Subject**: `[SECURITY] Portfolio Template Vulnerability`
3. **Description**: Detailed description of the issue
4. **Impact**: How this could affect users
5. **Reproduction**: Steps to reproduce

## Security Updates

Security updates will be released as patch versions (1.0.1, 1.0.2, etc.) and should be applied promptly.

## Responsible Disclosure

We appreciate security researchers who:
- Report vulnerabilities privately
- Allow reasonable time for fixes
- Avoid public disclosure before fixes are available
- Work collaboratively on solutions

Thank you for helping keep this template secure!
