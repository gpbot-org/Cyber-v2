// Color management helper functions

const errorRecovery = require('../../core/errorRecovery');

// Color mapping for reliability
const colorMap = {
    'blue': '#0084FF',      // Facebook Blue
    'red': '#FF0000',       // Standard Red
    'green': '#00FF00',     // Standard Green
    'purple': '#8B00FF',    // Standard Purple
    'pink': '#FF69B4',      // Hot Pink
    'orange': '#FFA500',    // Standard Orange
    'yellow': '#FFFF00',    // Standard Yellow
    'black': '#000000',     // Black
    'white': '#FFFFFF',     // White
    'gray': '#808080',      // Gray
    'grey': '#808080',      // Gray (alternative spelling)
    'facebook': '#0084FF',  // Facebook Blue
    'messenger': '#0084FF', // Messenger Blue
    'default': '#0084FF'    // Default Blue
};

// Theme mapping for presets
const themeMap = {
    'default': '#0084FF',
    'facebook': '#0084FF',
    'messenger': '#0084FF',
    'dark': '#000000',
    'light': '#FFFFFF',
    'blue': '#0084FF',
    'red': '#FF0000',
    'green': '#00FF00',
    'purple': '#8B00FF',
    'pink': '#FF69B4',
    'orange': '#FFA500'
};

// Helper function to handle color changes with fallbacks and rate limiting protection
async function handleColorChange(api, t, reply, getText, value) {
    try {
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Method 1: Try the new t.color() method first
        await t.color(value);
        return reply(getText("colorChanged", value));

    } catch (error1) {
        // Check for rate limiting errors
        if (isRateLimitError(error1)) {
            return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change colors to prevent spam.`);
        }

        try {
            // Add delay before fallback
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Method 2: Fallback to direct API call
            await api.changeThreadColor(value, t.id);
            return reply(getText("colorChanged", value));

        } catch (error2) {
            // Check for rate limiting errors
            if (isRateLimitError(error2)) {
                return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change colors to prevent spam.`);
            }

            // Method 3: Try with predefined color codes
            const colorCode = colorMap[value.toLowerCase()] || value;

            try {
                // Add delay before final attempt
                await new Promise(resolve => setTimeout(resolve, 2000));

                await api.changeThreadColor(colorCode, t.id);
                return reply(getText("colorChanged", value));

            } catch (error3) {
                // Check for rate limiting errors
                if (isRateLimitError(error3)) {
                    return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change colors to prevent spam.`);
                }

                // Log critical errors
                if (errorRecovery.isCriticalError(error3)) {
                    errorRecovery.logCriticalError(error3, `handleColorChange: ${value}`);
                }

                // If all methods fail, provide helpful error message
                if (error3.message && error3.message.includes('field_exception')) {
                    return reply(`⚠️ Facebook API limitation: Color change temporarily unavailable. Try again later or use: blue, red, green, purple, pink, orange`);
                }

                return reply(getText("error", `Color change failed. Available colors: blue, red, green, purple, pink, orange, or hex codes like #FF0000`));
            }
        }
    }
}

// Helper function to handle theme changes with fallbacks and rate limiting protection
async function handleThemeChange(api, t, reply, getText, value) {
    try {
        // Add delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Method 1: Try direct API call
        await api.changeThreadColor(value, t.id);
        return reply(getText("themeChanged", value));

    } catch (error1) {
        // Check for rate limiting errors
        if (isRateLimitError(error1)) {
            return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change themes to prevent spam.`);
        }

        try {
            // Add delay before fallback
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Method 2: Try with t.color() method
            await t.color(value);
            return reply(getText("themeChanged", value));

        } catch (error2) {
            // Check for rate limiting errors
            if (isRateLimitError(error2)) {
                return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change themes to prevent spam.`);
            }

            // Method 3: Try with predefined themes
            const themeCode = themeMap[value.toLowerCase()] || value;

            try {
                // Add delay before final attempt
                await new Promise(resolve => setTimeout(resolve, 2000));

                await api.changeThreadColor(themeCode, t.id);
                return reply(getText("themeChanged", value));

            } catch (error3) {
                // Check for rate limiting errors
                if (isRateLimitError(error3)) {
                    return reply(`⚠️ Facebook rate limit reached. Please wait 30 seconds before trying again.\n\n💡 Facebook limits how often you can change themes to prevent spam.`);
                }

                // Log critical errors
                if (errorRecovery.isCriticalError(error3)) {
                    errorRecovery.logCriticalError(error3, `handleThemeChange: ${value}`);
                }

                // If all methods fail, provide helpful error message
                if (error3.message && error3.message.includes('field_exception')) {
                    return reply(`⚠️ Facebook API limitation: Theme change temporarily unavailable. Try again later or use preset themes: default, dark, light, blue, red, green`);
                }

                return reply(getText("error", `Theme change failed. Available themes: default, dark, light, blue, red, green, purple, pink, orange`));
            }
        }
    }
}

// Ultra-minimal color handler with fallbacks
async function handleUltraColor(api, t, reply, value) {
    try {
        await t.color(value);
        return reply("✅ Color changed");
    } catch (e1) {
        try {
            await api.changeThreadColor(value, t.id);
            return reply("✅ Color changed");
        } catch (e2) {
            const color = colorMap[value.toLowerCase()] || value;
            try {
                await api.changeThreadColor(color, t.id);
                return reply("✅ Color changed");
            } catch (e3) {
                // Log critical errors
                if (errorRecovery.isCriticalError(e3)) {
                    errorRecovery.logCriticalError(e3, `handleUltraColor: ${value}`);
                }
                return reply("⚠️ Color change unavailable (Facebook API limit)");
            }
        }
    }
}

// Safe color change with fallbacks (for themes)
async function safeColorChange(t, api, color) {
    try {
        await t.color(color);
    } catch (error1) {
        try {
            await api.changeThreadColor(color, t.id);
        } catch (error2) {
            // Log critical errors
            if (errorRecovery.isCriticalError(error2)) {
                errorRecovery.logCriticalError(error2, `safeColorChange: ${color}`);
            }
            // Silently fail - theme will continue without color change
            console.log(`Color change failed: ${error2.message}`);
        }
    }
}

// Safe emoji change with fallbacks
async function safeEmojiChange(t, emoji) {
    try {
        await t.emoji(emoji);
    } catch (error) {
        // Silently fail - theme will continue without emoji change
        console.log(`Emoji change failed: ${error.message}`);
    }
}

// Test color with comprehensive error handling
async function testColor(api, t, reply, getText, colorInput) {
    await reply(getText("testing", colorInput));
    
    const color = colorMap[colorInput.toLowerCase()] || colorInput;
    
    // Method 1: Try t.color() first
    try {
        await t.color(color);
        return reply(getText("success", colorInput));
        
    } catch (error1) {
        console.log(`Method 1 failed: ${error1.message}`);
        
        // Method 2: Try direct API call
        try {
            await api.changeThreadColor(color, t.id);
            await reply(getText("fallback", colorInput));
            return reply(getText("success", colorInput));
            
        } catch (error2) {
            console.log(`Method 2 failed: ${error2.message}`);
            
            // Method 3: Try with Facebook blue as fallback
            try {
                await api.changeThreadColor("#0084FF", t.id);
                return reply(`⚠️ ${colorInput} failed, applied Facebook Blue instead.\n\n${getText("apiLimit")}`);
                
            } catch (error3) {
                console.log(`Method 3 failed: ${error3.message}`);
                
                // Log critical errors
                if (errorRecovery.isCriticalError(error3)) {
                    errorRecovery.logCriticalError(error3, `testColor: ${colorInput}`);
                }
                
                // Check if it's the specific Facebook API error
                if (error3.message && (
                    error3.message.includes('field_exception') ||
                    error3.message.includes('Query error') ||
                    error3.message.includes('server error')
                )) {
                    return reply(getText("apiLimit"));
                }
                
                return reply(getText("failed", colorInput));
            }
        }
    }
}

// Helper function to validate hex color
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Get available colors list
function getAvailableColors() {
    return Object.keys(colorMap);
}

// Get color code from name
function getColorCode(colorName) {
    return colorMap[colorName.toLowerCase()] || colorName;
}

// Helper function to detect rate limiting errors
function isRateLimitError(error) {
    const errorStr = JSON.stringify(error) || error.toString() || error.message || '';

    return errorStr.includes('You can\'t use this feature at the moment') ||
           errorStr.includes('We limit how often you can post') ||
           errorStr.includes('blockedAction') ||
           errorStr.includes('1390008') ||
           errorStr.includes('rate limit') ||
           errorStr.includes('too many requests') ||
           errorStr.includes('spam');
}

module.exports = {
    colorMap,
    themeMap,
    handleColorChange,
    handleThemeChange,
    handleUltraColor,
    safeColorChange,
    safeEmojiChange,
    testColor,
    isValidHexColor,
    getAvailableColors,
    getColorCode,
    isRateLimitError
};
