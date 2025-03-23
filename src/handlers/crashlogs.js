function loadError(client) {
    const { EmbedBuilder, WebhookClient } = require("discord.js");
    const chalk = require('chalk')

    const wbc = new WebhookClient({
        id: "1170369527125647430",//webhook id
        token: "mZsQdrwX1drHFOMt6i4PoWEQvisNrKjNxGX-cDLAxP6MkwbMv5u9xZez64RbFKkOMHpT", //webhook token
    });


    let errorembed = new EmbedBuilder()
        .setColor("Orange")
    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('HANDLER ') + chalk.white("Error Handling Loaded!"));

    process.on("beforeExit", (code) => {
        console.log(chalk.yellow.dim("[AntiCrash] | [BeforeExit_Logs] | [Start] : ==============="));
        console.log(code);
        console.log(chalk.yellow("[AntiCrash] | [BeforeExit_Logs] | [End] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**BEFORE EXIT LOGS**\n\`\`\`\n${code}\n\`\`\``)]})
    });
    process.on("unhandledRejection", async (reason, promise) => {
        // Needed
        console.log(chalk.yellow("[AntiCrash] | [UnhandledRejection_Logs] | [start] : ==============="));
        console.log(reason);
        console.log(chalk.yellow("[AntiCrash] | [UnhandledRejection_Logs] | [end] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**UNHANDLED_REJECTION_LOGS**\n\`\`\`\n${reason}\n\`\`\``)]})

    });
    process.on("rejectionHandled", (promise) => {
        // If You Want You Can Use
        console.log(chalk.yellow("[AntiCrash] | [RejectionHandled_Logs] | [Start] : ==============="));
        console.log(promise);
        console.log(chalk.yellow("[AntiCrash] | [RejectionHandled_Logs] | [End] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**REJECTION_HANDLED_LOGS**\n\`\`\`\n${promise}\n\`\`\``)]})
    });
    process.on("uncaughtException", (err, origin) => {
        // Needed
        console.log(chalk.yellow("[AntiCrash] | [UncaughtException_Logs] | [Start] : ==============="));
        console.log(err);
        console.log(chalk.yellow("[AntiCrash] | [UncaughtException_Logs] | [End] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**UNCAUGHT_EXCEPTION_LOGS**\n\`\`\`\n${err}\n\`\`\` \`ORIGIN: ${origin}\``)]})
    });
    process.on("uncaughtExceptionMonitor", (err, origin) => {
        // Needed
        console.log(chalk.yellow("[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [Start] : ==============="));
        console.log(err);
        console.log(chalk.yellow("[AntiCrash] | [UncaughtExceptionMonitor_Logs] | [End] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**UNCAUGHT_EXCEPTION_MONITOR_LOGS**\n\`\`\`\n${err}\n\`\`\` \`ORIGIN: ${origin}\``)]})
    });
    process.on("warning", (warning) => {
        // If You Want You Can Use
        console.log(chalk.yellow("[AntiCrash] | [Warning_Logs] | [Start] : ==============="));
        console.log(warning);
        console.log(chalk.yellow("[AntiCrash] | [Warning_Logs] | [End] : ==============="));
        wbc.send({embeds: [errorembed.setTitle("An error occured").setDescription(`**WARNING_LOGS**\n\`\`\`\n${warning}\n\`\`\``)]})
    });
}

module.exports = { loadError }