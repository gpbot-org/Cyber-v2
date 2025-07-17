// Ultra-minimal CMD-V2 help command - Advanced features in minimal code!

module.exports.config = {
    name: "help2",
    description: "Ultra-minimal advanced help system (CMD-V2 version)",
    usage: "help2 [command|category|page]",
    category: "system",
    permission: 0,
    cooldown: 2,
    prefix: false
};

module.exports.languages = {
    "en": {
        "header": "🚀 CYBER-V2 ULTRA HELP\n╔════════════════════════════╗\n║     ⚡ LIGHTNING FAST      ║\n╚════════════════════════════╝",
        "stats": "📊 Commands: %1 | Categories: %2 | Page: %3/%4",
        "category": "\n🔸 %1 (%2 commands):",
        "cmdPrefix": "  +%1 - %2",
        "cmdNoPrefix": "  %1 - %2",
        "footer": "\n💡 help2 [cmd] | help2 [category] | help2 [page]\n🎯 Categories: %1",
        "cmdDetail": "╔════════════════════════════╗\n║        📖 %1        ║\n╚════════════════════════════╝\n\n📝 %2\n🔧 Usage: %3%4 %5\n📂 Category: %6\n🔐 Permission: %7\n🎯 Prefix: %8",
        "notFound": "❌ '%1' not found! Use 'help2' to see all commands",
        "permissions": ["Everyone", "Moderator", "Admin"],
        "prefixStatus": ["No", "Yes"]
    }
};

module.exports.run = async ({ args, b, reply, getText }) => {
    const CMDS_PER_PAGE = 15;
    
    if (!args.length) return showList(1, b, reply, getText, CMDS_PER_PAGE);
    
    const query = args[0].toLowerCase();
    const cmd = b.commands?.get?.(query) || global.client.commands.get(query);
    
    if (cmd) {
        const perm = getText("permissions")[cmd.config.hasPermssion] || "Everyone";
        const prefix = cmd.config.prefix !== false ? getText("prefixStatus")[1] : getText("prefixStatus")[0];
        return reply(getText("cmdDetail", cmd.config.name, cmd.config.description, 
            cmd.config.prefix !== false ? b.prefix : "", cmd.config.name, 
            cmd.config.usages || cmd.config.name, cmd.config.commandCategory || "general", perm, prefix));
    }
    
    // Check if it's a page number
    if (!isNaN(query)) return showList(parseInt(query), b, reply, getText, CMDS_PER_PAGE);
    
    return reply(getText("notFound", query));
};

function showList(page, b, reply, getText, perPage) {
    const commands = global.client.commands;
    const total = commands.size;
    const totalPages = Math.ceil(total / perPage);
    page = Math.max(1, Math.min(page, totalPages));
    
    const categories = {};
    const allCmds = Array.from(commands.values()).slice((page-1) * perPage, page * perPage);
    
    for (const cmd of allCmds) {
        const cat = cmd.config.commandCategory || 'general';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd);
    }
    
    let msg = getText("header") + "\n\n" + getText("stats", total, Object.keys(categories).length, page, totalPages);
    
    for (const [cat, cmds] of Object.entries(categories)) {
        msg += getText("category", cat.toUpperCase(), cmds.length);
        for (const cmd of cmds) {
            msg += cmd.config.prefix !== false ? 
                getText("cmdPrefix", cmd.config.name, cmd.config.description) + "\n" :
                getText("cmdNoPrefix", cmd.config.name, cmd.config.description) + "\n";
        }
    }
    
    const cats = Object.keys(categories).join(", ");
    msg += getText("footer", cats);
    
    return reply(msg);
}
