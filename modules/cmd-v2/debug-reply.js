module.exports.config = {
    name: "debugreply",
    description: "Debug reply message structure",
    category: "utility",
    permission: 1,
    prefix: true
};

module.exports.run = async ({ event, reply }) => {
    return reply(`Event type: ${event.type}\nHas messageReply: ${!!event.messageReply}\nFull event: ${JSON.stringify(event, null, 2).substring(0, 1000)}`);
};