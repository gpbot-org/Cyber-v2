# 🔧 Troubleshooting Guide

Common issues and solutions for Cyber-v2 Bot.

## 🚨 Common Issues

### 1. Bot Won't Start

#### Error: `Cannot find module`
```
❌ Error: Cannot find module 'xyz'
```
**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Error: `Permission denied`
```
❌ EACCES: permission denied
```
**Solution:**
```bash
# Fix permissions (Linux/Mac)
sudo chown -R $USER:$USER .
chmod -R 755 .

# Windows: Run as Administrator
```

#### Error: `Port already in use`
```
❌ Port 3000 already in use
```
**Solution:**
```bash
# Kill process using port
sudo lsof -ti:3000 | xargs kill -9

# Or change port in config.json
```

### 2. Facebook Login Issues

#### Error: `Login failed`
```
❌ Login failed: Invalid credentials
```
**Solutions:**
1. **Update cookies.json** with fresh Facebook cookies
2. **Check account status** - ensure account isn't locked
3. **Try different login method** - email/password vs cookies
4. **Clear browser cache** and get new cookies

#### Error: `Checkpoint required`
```
❌ Checkpoint required
```
**Solutions:**
1. Login to Facebook manually and complete checkpoint
2. Use a different Facebook account
3. Wait 24-48 hours and try again

#### Error: `Rate limited`
```
❌ Rate limited by Facebook
```
**Solutions:**
1. Wait 1-2 hours before retrying
2. Reduce bot activity frequency
3. Use different Facebook account

### 3. Command Issues

#### Commands not responding
**Check:**
1. **Prefix configuration** in config.json
2. **Command file syntax** - check for errors
3. **Bot permissions** in the chat
4. **Command cooldowns** - wait and try again

#### Error: `Command not found`
```
❌ Command 'xyz' not found
```
**Solutions:**
1. Check command file exists in correct folder
2. Verify command name in config
3. Restart bot to reload commands
4. Check file permissions

#### CMD-V2 commands not loading
**Check:**
1. Files are in `modules/cmd-v2/` folder
2. Correct file structure and exports
3. No syntax errors in command files
4. Translator system is working

### 4. Database Issues

#### Error: `Database connection failed`
```
❌ Failed to connect to database
```
**Solutions:**
1. Check database path in config.json
2. Ensure assets/data/ folder exists
3. Check file permissions
4. Verify disk space

#### Data not saving
**Check:**
1. Write permissions on data folder
2. Disk space availability
3. Database file corruption
4. Proper database calls in code

### 5. Performance Issues

#### Bot running slowly
**Solutions:**
1. **Check memory usage** - restart if high
2. **Clear temp files** in assets/temp/
3. **Optimize commands** - remove heavy operations
4. **Update dependencies** - `npm update`

#### High CPU usage
**Check:**
1. Infinite loops in commands
2. Heavy API calls without delays
3. Large file operations
4. Memory leaks

### 6. Network Issues

#### API requests failing
```
❌ HTTP request failed
```
**Solutions:**
1. Check internet connection
2. Verify API endpoints are working
3. Add timeout to requests
4. Use try-catch for error handling

#### Slow response times
**Solutions:**
1. Add request timeouts
2. Use caching for repeated requests
3. Optimize API calls
4. Check network latency

## 🔍 Debugging Tips

### Enable Debug Mode
Add to config.json:
```json
{
  "facebook": {
    "logLevel": "debug"
  }
}
```

### Check Log Files
```bash
# View recent logs
tail -f assets/logs/bot.log

# Search for errors
grep "ERROR" assets/logs/bot.log

# Check specific command logs
grep "command_name" assets/logs/bot.log
```

### Test Commands Manually
```javascript
// Add to command for debugging
console.log("Debug:", { args, event, user });
```

### Monitor Performance
```javascript
// Add timing to commands
const start = Date.now();
// Your command code
console.log(`Command took ${Date.now() - start}ms`);
```

## 🛠️ Advanced Troubleshooting

### Memory Leaks
```bash
# Monitor memory usage
node --inspect run.js

# Use heap snapshots
node --heap-prof run.js
```

### Database Corruption
```bash
# Backup current data
cp -r assets/data assets/data.backup

# Reset database (last resort)
rm -rf assets/data/*
# Bot will recreate default structure
```

### Facebook API Changes
1. Check GA-FCA updates
2. Update to latest version
3. Check community forums
4. Report issues on GitHub

## 📊 Health Checks

### Bot Status Check
```javascript
// Add to a command
module.exports.run = async ({ reply, b }) => {
    const status = {
        uptime: b.up(),
        memory: process.memoryUsage(),
        commands: global.client.commands.size
    };
    return reply(`Status: ${JSON.stringify(status, null, 2)}`);
};
```

### Database Health
```javascript
// Check database connectivity
const userData = d.u.get("test-user-id");
const threadData = d.t.get("test-thread-id");
```

### Network Health
```javascript
// Test API connectivity
try {
    await get("https://httpbin.org/status/200");
    reply("✅ Network OK");
} catch (error) {
    reply("❌ Network issues");
}
```

## 🆘 Getting Help

### Before Asking for Help
1. **Check this troubleshooting guide**
2. **Search existing GitHub issues**
3. **Enable debug logging**
4. **Test with minimal configuration**

### When Creating an Issue
Include:
- **System information** (OS, Node.js version)
- **Bot configuration** (without sensitive data)
- **Error messages** (full stack trace)
- **Steps to reproduce**
- **Expected vs actual behavior**

### Useful Commands
```bash
# System info
node --version
npm --version
uname -a

# Bot info
npm list
ls -la modules/
cat config.json | grep -v password
```

## 🔄 Recovery Procedures

### Complete Reset
```bash
# Backup important data
cp config.json config.json.backup
cp -r assets/data assets/data.backup

# Clean install
rm -rf node_modules package-lock.json
npm install

# Reset configuration
cp config.example.json config.json
# Reconfigure as needed
```

### Partial Reset
```bash
# Reset commands only
rm -rf modules/cmd-v2/*
# Re-add your commands

# Reset database only
rm -rf assets/data/*
# Bot will recreate structure
```

---

**Still having issues? Create a GitHub issue with detailed information!**

**Next**: [Installation Guide](./installation.md) | [Performance](./performance.md)
