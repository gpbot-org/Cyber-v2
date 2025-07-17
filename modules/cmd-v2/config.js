// Ultra-minimal config display - Just 3 lines!

module.exports.config = {
    name: "config",
    description: "Show current bot configuration",
    prefix: true,
    permission: 1
};

module.exports.run = async ({ b, reply }) => {
    return reply(`⚙️ Bot Configuration:\n\n🤖 Name: ${b.name}\n👑 Owner: ${b.owner}\n🔧 Prefix: ${b.prefix}\n⏱️ Uptime: ${formatUptime(b.up())}`);
};

function formatUptime(ms) {
    const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
    return d > 0 ? `${d}d ${h % 24}h ${m % 60}m` : h > 0 ? `${h}h ${m % 60}m ${s % 60}s` : m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
}
