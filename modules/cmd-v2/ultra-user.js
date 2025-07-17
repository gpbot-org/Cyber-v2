// Ultra-minimal user info - Just 5 lines!

module.exports.config = {
    name: "uuser",
    description: "Ultra-minimal user info",
    prefix: true
};

module.exports.run = async ({ u, d, reply }) => {
    const user = d.u.get(u.id);
    return reply(`👤 ${(await u.info()).name}\n⭐ Level: ${user.level}\n💰 Money: ${user.money}`);
};
