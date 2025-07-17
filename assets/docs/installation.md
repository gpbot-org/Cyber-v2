# 🚀 Installation Guide

Complete guide to install and set up your Cyber-v2 Bot.

## 📋 Prerequisites

### System Requirements
- **Node.js** v16.0.0 or higher
- **npm** v7.0.0 or higher
- **Git** (for cloning repository)
- **Facebook Account** (for bot login)

### Supported Platforms
- ✅ **Windows** 10/11
- ✅ **macOS** 10.15+
- ✅ **Linux** (Ubuntu 18.04+, CentOS 7+)
- ✅ **Docker** (containerized deployment)

## 📥 Installation Methods

### Method 1: Git Clone (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-repo/cyber-v2-bot.git
cd cyber-v2-bot

# Install dependencies
npm install

# Copy configuration template
cp config.example.json config.json
```

### Method 2: Download ZIP
1. Download the latest release from GitHub
2. Extract the ZIP file
3. Open terminal in the extracted folder
4. Run `npm install`
5. Copy `config.example.json` to `config.json`

### Method 3: Docker (Advanced)
```bash
# Pull the Docker image
docker pull cyber-v2-bot:latest

# Run with Docker Compose
docker-compose up -d
```

## ⚙️ Configuration

### 1. Basic Configuration
Edit `config.json`:

```json
{
  "botName": "Cyber-v2",
  "prefix": "+",
  "botOwner": "Your Name",
  "adminIDs": ["your-facebook-user-id"],
  "language": "en",
  "database": {
    "type": "json",
    "path": "./assets/data/"
  },
  "facebook": {
    "appStatePath": "./cookies.json",
    "forceLogin": false,
    "logLevel": "info"
  }
}
```

### 2. Facebook Login Setup

#### Option A: Cookies Method (Recommended)
1. Install browser extension for cookie extraction
2. Login to Facebook in your browser
3. Extract cookies and save to `cookies.json`
4. Format should be:
```json
[
  {
    "key": "cookie_name",
    "value": "cookie_value",
    "domain": ".facebook.com"
  }
]
```

#### Option B: Email/Password (Less Secure)
```json
{
  "facebook": {
    "email": "your-email@example.com",
    "password": "your-password",
    "appStatePath": "./cookies.json"
  }
}
```

### 3. Environment Variables
Create `.env` file:
```env
NODE_ENV=production
BOT_PREFIX=+
ADMIN_ID=your-facebook-id
LOG_LEVEL=info
```

## 🔧 Dependencies

### Core Dependencies
```json
{
  "fca-unofficial": "^1.3.10",
  "axios": "^1.6.0",
  "fs-extra": "^11.1.1",
  "moment": "^2.29.4",
  "chalk": "^4.1.2"
}
```

### Development Dependencies
```json
{
  "nodemon": "^3.0.1",
  "eslint": "^8.50.0",
  "prettier": "^3.0.3"
}
```

### Install All Dependencies
```bash
# Production dependencies only
npm install --production

# All dependencies (including dev)
npm install

# Update dependencies
npm update
```

## 📁 Directory Structure

After installation, your project should look like:

```
cyber-v2-bot/
├── assets/
│   ├── data/           # Database files
│   ├── docs/           # Documentation
│   └── temp/           # Temporary files
├── core/
│   ├── bot.js          # Main bot class
│   ├── commandHandler.js
│   ├── translator.js   # CMD-V2 translator
│   └── database.js
├── modules/
│   ├── commands/       # Regular commands
│   ├── cmd-v2/         # CMD-V2 commands
│   └── events/         # Event handlers
├── config.json         # Bot configuration
├── cookies.json        # Facebook cookies
├── package.json
└── run.js             # Entry point
```

## 🚀 First Run

### 1. Start the Bot
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# With PM2 (process manager)
pm2 start run.js --name "cyber-v2-bot"
```

### 2. Verify Installation
Look for these success messages:
```
✅ Configuration loaded
✅ Database loaded successfully
✅ Login successful
✅ Cyber-v2 Bot started successfully!
📝 Prefix: +
```

### 3. Test Basic Commands
Send these messages to your bot:
- `+ping` - Check response time
- `+help` - Show command list
- `hi` - Test no-prefix command
- `+info` - Bot information

## 🔍 Troubleshooting

### Common Issues

#### 1. Login Failed
```
❌ Login failed: Invalid credentials
```
**Solution:**
- Update your cookies.json file
- Check Facebook account status
- Try different login method

#### 2. Permission Denied
```
❌ EACCES: permission denied
```
**Solution:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
chmod -R 755 .
```

#### 3. Module Not Found
```
❌ Cannot find module 'xyz'
```
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Already in Use
```
❌ Port 3000 already in use
```
**Solution:**
```bash
# Kill process using port
sudo lsof -ti:3000 | xargs kill -9

# Or change port in config
```

### Debug Mode
Enable detailed logging:
```json
{
  "facebook": {
    "logLevel": "debug"
  }
}
```

### Log Files
Check these files for errors:
- `./logs/bot.log` - General bot logs
- `./logs/error.log` - Error logs
- `./logs/debug.log` - Debug information

## 🔒 Security Setup

### 1. Secure Configuration
```bash
# Set proper file permissions
chmod 600 config.json cookies.json
chmod 700 assets/data/
```

### 2. Environment Variables
Move sensitive data to `.env`:
```env
FACEBOOK_EMAIL=your-email
FACEBOOK_PASSWORD=your-password
ADMIN_IDS=id1,id2,id3
```

### 3. Firewall Setup
```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 3000  # Bot port
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

## 📊 Performance Optimization

### 1. PM2 Configuration
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'cyber-v2-bot',
    script: 'run.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

### 2. System Limits
```bash
# Increase file descriptor limits
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

### 3. Memory Management
```json
{
  "node_options": "--max-old-space-size=2048"
}
```

## 🔄 Updates

### Manual Update
```bash
# Backup current installation
cp -r . ../cyber-v2-bot-backup

# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Restart bot
npm restart
```

### Automatic Updates
Set up a cron job:
```bash
# Edit crontab
crontab -e

# Add update job (daily at 3 AM)
0 3 * * * cd /path/to/bot && git pull && npm update && pm2 restart cyber-v2-bot
```

## ✅ Verification Checklist

After installation, verify:
- [ ] Bot starts without errors
- [ ] Facebook login successful
- [ ] Database files created
- [ ] Commands respond correctly
- [ ] Admin permissions work
- [ ] File permissions secure
- [ ] Logs are being written
- [ ] Auto-restart configured

## 📞 Support

If you encounter issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review log files for errors
3. Search existing GitHub issues
4. Create a new issue with:
   - System information
   - Error messages
   - Configuration (without sensitive data)
   - Steps to reproduce

---

**Next**: [Quick Start](./quick-start.md) | [Configuration](./configuration.md)
