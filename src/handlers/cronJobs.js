const cron = require('node-cron')
const fs = require('fs')
const chalk = require("chalk");

async function loadCronJobs (client) {

    const jobFiles = fs.readdirSync('./src/jobs').filter(file => file.endsWith('.js'));

    for (const jobFile of jobFiles) {
        const job = require(`../jobs/${jobFile}`);

        if ('data' in job && 'execute' in job) {
            if ('init' in job) {
                if (job.data.skip === true) {
                    console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('JOB: ') + chalk.white(job.data.name) + chalk.white(' SKIPPED.'));
                } else {
                    try {
                        await job.init(client);
                        client.jobs.set(job.data.name, job)
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
        } else {
            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('JOB: ') + chalk.white(job.data.name) + chalk.white(' unable to load.'));
        }
    }

    client.jobs.forEach(job => {
        if (cron.validate(job.data.cron)) {
            cron.schedule(job.data.cron, async () => {
                try {
                    job.execute(client);
                } catch (e) {
                    console.error(e);
                }
            })
            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.green('INFO') + chalk.white('] ') + chalk.green('JOB: ') + chalk.white(job.data.name) + chalk.white(' scheduled and loaded.'));
        } else {
            console.log(chalk.gray(` ${String(new Date).split(" ", 5).join(" ")} `) + chalk.white('[') + chalk.red('INFO') + chalk.white('] ') + chalk.green('JOB: ') + chalk.white(job.data.name) + chalk.white(' unable to load.'));
        }
    })
}

module.exports = { loadCronJobs };