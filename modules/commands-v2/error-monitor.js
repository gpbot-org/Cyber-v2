// Error monitoring and recovery management

module.exports.config = {
    name: "errmon",
    aliases: ["errormonitor", "errors", "recovery"],
    description: "Monitor critical errors and auto-restart system",
    usage: "errmon [status|errors|reset|restart|logs]",
    category: "admin",
    permission: 2,
    cooldown: 5,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "🚨 ERROR MONITOR\n\n🔸 errmon status - Current error status\n🔸 errmon errors - Recent critical errors\n🔸 errmon reset - Reset error counter\n🔸 errmon restart - Force restart\n🔸 errmon logs - View error logs",
        
        "status": "🚨 ERROR RECOVERY STATUS\n\n📊 Critical Errors: %1\n⏰ Time Window: %2 minutes\n🔄 Restart Threshold: %3 errors\n⚡ Next Restart In: %4 errors\n🕐 Last Restart: %5\n📈 Recent Errors (1h): %6\n\n🎯 Error Types:\n%7\n\n⚠️ Auto-restart: %8",
        
        "errorList": "🚨 RECENT CRITICAL ERRORS:\n\n%1\n\n💡 Error Types:\n• FACEBOOK_API - Facebook server issues\n• USER_INFO - User data retrieval failures\n• NETWORK - Connection problems\n• TIMEOUT - Request timeouts\n• LOGIN - Authentication issues",
        
        "noErrors": "✅ No critical errors detected!\n\n🎯 System is running smoothly.",
        
        "errorEntry": "%1. [%2] %3\n   Type: %4 | Time: %5\n",
        
        "resetSuccess": "🔄 Error counter reset successfully!\n\n✅ Auto-restart threshold reset\n📊 Error history cleared",
        
        "restartInitiated": "🔄 Manual restart initiated...\n\n⚠️ Bot will restart in 3 seconds",
        
        "logs": "📋 ERROR LOG SUMMARY\n\nLog file: %1\nTotal entries: %2\nLast error: %3\n\n💡 Use 'errmon errors' for detailed view",
        
        "enabled": "✅ Enabled",
        "disabled": "❌ Disabled",
        "never": "Never",
        "unknown": "Unknown"
    }
};

module.exports.run = async ({ args, reply, getText, _ }) => {
    const errorRecovery = require('../../core/errorRecovery');
    const action = args[0]?.toLowerCase() || "status";
    
    try {
        switch (action) {
            case "status":
                return await showErrorStatus(errorRecovery, reply, getText, _);
                
            case "errors":
                return await showRecentErrors(errorRecovery, reply, getText, _);
                
            case "reset":
                errorRecovery.resetErrors();
                return reply(getText("resetSuccess"));
                
            case "restart":
                await reply(getText("restartInitiated"));
                setTimeout(() => {
                    process.exit(1); // Force restart
                }, 3000);
                break;
                
            case "logs":
                return await showErrorLogs(errorRecovery, reply, getText, _);
                
            default:
                return reply(getText("usage"));
        }
    } catch (error) {
        return reply(`❌ Monitor error: ${error.message}`);
    }
};

// Show current error status
async function showErrorStatus(errorRecovery, reply, getText, _) {
    const stats = errorRecovery.getErrorStats();
    
    const timeWindow = 5; // 5 minutes
    const restartThreshold = 10;
    const nextRestart = Math.max(0, restartThreshold - stats.totalErrors);
    const lastRestart = stats.lastRestart > 0 ? 
        _.time(stats.lastRestart) : getText("never");
    
    // Format error types
    let errorTypes = "";
    for (const [type, count] of Object.entries(stats.errorsByType)) {
        errorTypes += `• ${type}: ${count}\n`;
    }
    if (!errorTypes) errorTypes = "• No errors detected";
    
    const autoRestart = stats.totalErrors >= restartThreshold ? 
        getText("enabled") : getText("disabled");
    
    return reply(getText("status",
        stats.totalErrors,
        timeWindow,
        restartThreshold,
        nextRestart,
        lastRestart,
        stats.recentErrors,
        errorTypes.trim(),
        autoRestart
    ));
}

// Show recent errors
async function showRecentErrors(errorRecovery, reply, getText, _) {
    const stats = errorRecovery.getErrorStats();
    
    if (stats.totalErrors === 0) {
        return reply(getText("noErrors"));
    }
    
    // Get recent errors (access private property for demo)
    const recentErrors = errorRecovery.criticalErrors || [];
    
    let errorList = "";
    recentErrors.slice(0, 10).forEach((error, index) => {
        const timeStr = new Date(error.timestamp).toLocaleTimeString();
        const message = error.message.length > 50 ? 
            error.message.substring(0, 50) + "..." : error.message;
        
        errorList += getText("errorEntry",
            index + 1,
            error.context || "UNKNOWN",
            message,
            error.type,
            timeStr
        );
    });
    
    return reply(getText("errorList", errorList.trim()));
}

// Show error logs
async function showErrorLogs(errorRecovery, reply, getText, _) {
    const fs = require('fs');
    const path = require('path');
    
    const logPath = path.join(__dirname, '../../assets/logs/critical-errors.log');
    
    try {
        if (!fs.existsSync(logPath)) {
            return reply("📋 No error log file found\n\n✅ System is clean!");
        }
        
        const logContent = fs.readFileSync(logPath, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        const lastError = lines.length > 0 ? 
            lines[lines.length - 1].substring(0, 50) + "..." : "None";
        
        return reply(getText("logs",
            logPath,
            lines.length,
            lastError
        ));
        
    } catch (error) {
        return reply(`❌ Failed to read logs: ${error.message}`);
    }
}

// Helper function to format time ago
function timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
}
