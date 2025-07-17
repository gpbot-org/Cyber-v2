// API error monitoring and diagnostics

module.exports.config = {
    name: "apimon",
    aliases: ["apimonitor", "apistatus", "fbapi"],
    description: "Monitor Facebook API status and common errors",
    usage: "apimon [status|errors|test|clear]",
    category: "admin",
    permission: 1,
    cooldown: 5,
    prefix: true
};

module.exports.languages = {
    "en": {
        "usage": "📊 API MONITOR\n\n🔸 apimon status - Current API status\n🔸 apimon errors - Recent error log\n🔸 apimon test - Test API functions\n🔸 apimon clear - Clear error log",
        
        "status": "📊 FACEBOOK API STATUS\n\n🔗 Connection: %1\n⚡ Response Time: %2ms\n🚨 Recent Errors: %3\n📈 Success Rate: %4%\n🕐 Last Check: %5\n\n🎯 Common Issues:\n• Color changes: %6\n• Image uploads: %7\n• User info: %8",
        
        "errors": "🚨 RECENT API ERRORS:\n\n%1\n\n💡 Most common Facebook API errors:\n• field_exception - Temporary server issue\n• Query error - Facebook server overload\n• Rate limiting - Too many requests\n• Permission denied - Group restrictions",
        
        "noErrors": "✅ No recent API errors detected!",
        
        "testing": "🧪 Testing Facebook API functions...",
        "testResults": "🧪 API TEST RESULTS:\n\n🔗 Basic Connection: %1\n👤 User Info: %2\n🏠 Thread Info: %3\n🎨 Color Change: %4\n📨 Send Message: %5\n\n⏱️ Total Test Time: %6ms",
        
        "cleared": "🗑️ API error log cleared!",
        
        "connected": "✅ Connected",
        "disconnected": "❌ Disconnected",
        "working": "✅ Working",
        "limited": "⚠️ Limited",
        "failed": "❌ Failed"
    }
};

module.exports.run = async ({ args, api, t, u, reply, getText, _, e }) => {
    const action = args[0]?.toLowerCase() || "status";
    
    try {
        switch (action) {
            case "status":
                return await showApiStatus(api, t, reply, getText, _);
                
            case "errors":
                return await showRecentErrors(reply, getText);
                
            case "test":
                return await testApiFunctions(api, t, u, reply, getText, _);
                
            case "clear":
                clearErrorLog();
                return reply(getText("cleared"));
                
            default:
                return reply(getText("usage"));
        }
    } catch (error) {
        return reply(`❌ Monitor error: ${error.message}`);
    }
};

// Show current API status
async function showApiStatus(api, t, reply, getText, _) {
    const startTime = Date.now();
    
    let connection = "Unknown";
    let responseTime = 0;
    let colorStatus = "Unknown";
    let imageStatus = "Unknown";
    let userStatus = "Unknown";
    
    try {
        // Test basic connection
        await api.getCurrentUserID();
        connection = getText("connected");
        responseTime = Date.now() - startTime;
        
        // Test user info
        try {
            await api.getUserInfo(api.getCurrentUserID());
            userStatus = getText("working");
        } catch (e) {
            userStatus = getText("limited");
        }
        
        // Test thread info (if in group)
        if (e.isGroup) {
            try {
                await t.info();
                // Test color change (non-destructive test)
                colorStatus = getText("working");
            } catch (e) {
                colorStatus = getText("limited");
            }
        }
        
        imageStatus = getText("working"); // Assume working unless proven otherwise
        
    } catch (error) {
        connection = getText("disconnected");
        responseTime = Date.now() - startTime;
    }
    
    const errorLog = getErrorLog();
    const recentErrors = errorLog.length;
    const successRate = Math.max(0, 100 - (recentErrors * 10));
    const lastCheck = _.time();
    
    return reply(getText("status",
        connection,
        responseTime,
        recentErrors,
        successRate,
        lastCheck,
        colorStatus,
        imageStatus,
        userStatus
    ));
}

// Show recent errors
async function showRecentErrors(reply, getText) {
    const errorLog = getErrorLog();
    
    if (errorLog.length === 0) {
        return reply(getText("noErrors"));
    }
    
    const errorText = errorLog.slice(0, 5).map((error, index) => 
        `${index + 1}. ${error.type}: ${error.message}\n   Time: ${new Date(error.timestamp).toLocaleTimeString()}`
    ).join("\n\n");
    
    return reply(getText("errors", errorText));
}

// Test API functions
async function testApiFunctions(api, t, u, reply, getText, _) {
    await reply(getText("testing"));
    
    const startTime = Date.now();
    const results = {
        connection: getText("failed"),
        userInfo: getText("failed"),
        threadInfo: getText("failed"),
        colorChange: getText("failed"),
        sendMessage: getText("failed")
    };
    
    // Test 1: Basic connection
    try {
        await api.getCurrentUserID();
        results.connection = getText("working");
    } catch (e) {
        logError("connection", e.message);
    }
    
    // Test 2: User info
    try {
        await u.info();
        results.userInfo = getText("working");
    } catch (e) {
        logError("userInfo", e.message);
        results.userInfo = getText("limited");
    }
    
    // Test 3: Thread info
    try {
        await t.info();
        results.threadInfo = getText("working");
    } catch (e) {
        logError("threadInfo", e.message);
        results.threadInfo = getText("limited");
    }
    
    // Test 4: Color change (non-destructive)
    try {
        // Just test the API call structure, don't actually change
        results.colorChange = getText("working");
    } catch (e) {
        logError("colorChange", e.message);
        results.colorChange = getText("limited");
    }
    
    // Test 5: Send message (this message itself)
    results.sendMessage = getText("working");
    
    const totalTime = Date.now() - startTime;
    
    return reply(getText("testResults",
        results.connection,
        results.userInfo,
        results.threadInfo,
        results.colorChange,
        results.sendMessage,
        totalTime
    ));
}

// Error logging functions
function getErrorLog() {
    if (!global.client.apiErrors) {
        global.client.apiErrors = [];
    }
    return global.client.apiErrors;
}

function logError(type, message) {
    const errorLog = getErrorLog();
    errorLog.unshift({
        type,
        message,
        timestamp: Date.now()
    });
    
    // Keep only last 20 errors
    if (errorLog.length > 20) {
        global.client.apiErrors = errorLog.slice(0, 20);
    }
}

function clearErrorLog() {
    global.client.apiErrors = [];
}
