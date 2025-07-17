const fs = require('fs');
const path = require('path');

class LanguageManager {
    constructor(defaultLang = 'en') {
        this.defaultLang = defaultLang;
        this.currentLang = defaultLang;
        this.languages = new Map();
        this.langPath = path.join(__dirname, '..', 'lang');
        
        this.loadLanguages();
    }
    
    loadLanguages() {
        try {
            const langFiles = fs.readdirSync(this.langPath).filter(file => file.endsWith('.json'));
            
            for (const file of langFiles) {
                const langCode = path.basename(file, '.json');
                const langData = JSON.parse(fs.readFileSync(path.join(this.langPath, file), 'utf8'));
                this.languages.set(langCode, langData);
            }
            
            console.log(`✅ Loaded ${this.languages.size} language(s): ${Array.from(this.languages.keys()).join(', ')}`);
        } catch (error) {
            console.error('❌ Error loading languages:', error.message);
        }
    }
    
    setLanguage(langCode) {
        if (this.languages.has(langCode)) {
            this.currentLang = langCode;
            return true;
        }
        return false;
    }
    
    getLanguage() {
        return this.currentLang;
    }
    
    getAvailableLanguages() {
        return Array.from(this.languages.keys());
    }
    
    getText(key, ...replacements) {
        const lang = this.currentLang;
        const langData = this.languages.get(lang) || this.languages.get(this.defaultLang);

        if (!langData) {
            return `[LANG_ERROR: ${key}]`;
        }

        let text = this.getNestedValue(langData, key);

        if (!text) {
            // Fallback to default language
            const defaultLangData = this.languages.get(this.defaultLang);
            text = defaultLangData ? this.getNestedValue(defaultLangData, key) : null;
        }

        if (!text) {
            return `[MISSING: ${key}]`;
        }

        // Replace %1, %2, etc. placeholders (MiraiV2 style)
        replacements.forEach((replacement, index) => {
            text = text.replace(new RegExp(`%${index + 1}`, 'g'), replacement);
        });

        return text;
    }
    
    getNestedValue(obj, key) {
        return key.split('.').reduce((current, prop) => {
            return current && current[prop] !== undefined ? current[prop] : null;
        }, obj);
    }
    
    // Shorthand method
    t(key, ...replacements) {
        return this.getText(key, ...replacements);
    }
    
    // Get all texts for a category
    getCategory(category, langCode = null) {
        const lang = langCode || this.currentLang;
        const langData = this.languages.get(lang) || this.languages.get(this.defaultLang);
        
        if (!langData) {
            return {};
        }
        
        return this.getNestedValue(langData, category) || {};
    }
    
    // Format time for different languages
    formatTime(seconds, langCode = null) {
        const lang = langCode || this.currentLang;
        
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let parts = [];
        
        if (lang === 'bn') {
            if (days > 0) parts.push(`${days} din`);
            if (hours > 0) parts.push(`${hours} ghonta`);
            if (minutes > 0) parts.push(`${minutes} minute`);
            if (secs > 0) parts.push(`${secs} second`);
        } else {
            if (days > 0) parts.push(`${days}d`);
            if (hours > 0) parts.push(`${hours}h`);
            if (minutes > 0) parts.push(`${minutes}m`);
            if (secs > 0) parts.push(`${secs}s`);
        }
        
        return parts.join(' ') || '0s';
    }
    
    // Reload languages (useful for development)
    reload() {
        this.languages.clear();
        this.loadLanguages();
    }
}

module.exports = LanguageManager;
