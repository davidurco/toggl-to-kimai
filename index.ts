import inquirer from 'inquirer';
import chalk from 'chalk';
import { DateTime, Duration } from 'luxon';
import { TogglClient } from "./clients/ToggleClient";
import { KimaiClient } from "./clients/KimaiClient";

(async () => {
    try {
        console.log(chalk.cyanBright('\n👋 Welcome to Toggl → Kimai sync CLI!\n'));
        console.log(`Let’s get you set up.\n`);

        const { TOGGL_API_URL, TOGGL_API_KEY, KIMAI_API_URL, KIMAI_API_KEY } = await inquirer.prompt([
            {
                type: 'input',
                name: 'TOGGL_API_URL',
                message: `Toggl API URL:`,
                default: 'https://api.track.toggl.com/api/v9'
            },
            {
                type: 'password',
                name: 'TOGGL_API_KEY',
                message: `Toggl API Token ${chalk.gray('[Get it here]')} ${chalk.underline('https://track.toggl.com/profile#api-token')}:`
            },
            {
                type: 'input',
                name: 'KIMAI_API_URL',
                message: 'Kimai API URL:',
                default: 'https://www.kimai.cloud/api'
            },
            {
                type: 'password',
                name: 'KIMAI_API_KEY',
                message: ({ KIMAI_API_URL }) => `Kimai API Token ${chalk.gray('[Get it here]')} ${chalk.underline(`${KIMAI_API_URL}/en/profile/YOUR_USERNAME/api-token`)}:`
            }
        ]);

        console.log(chalk.green('\n✅ API setup complete! Now let’s pick the date range to import from Toggl.\n'));

        const { START_DATE, END_DATE } = await inquirer.prompt([
            {
                type: 'input',
                name: 'START_DATE',
                message: 'Start date (YYYY-MM-DD):',
                validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please enter a valid date format: YYYY-MM-DD',
                default: DateTime.local().startOf('month').toFormat('yyyy-MM-dd')
            },
            {
                type: 'input',
                name: 'END_DATE',
                message: 'End date (YYYY-MM-DD):',
                validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || 'Please enter a valid date format: YYYY-MM-DD',
                default: DateTime.local().endOf('month').toFormat('yyyy-MM-dd'),
            }
        ]);

        const toggl = new TogglClient(TOGGL_API_URL, `${TOGGL_API_KEY}:api_token`);
        const kimai = new KimaiClient(KIMAI_API_URL, KIMAI_API_KEY);

        const togglProjects = await toggl.getProjects();
        const togglTimeEntries = await toggl.getTimeEntries(START_DATE, END_DATE);
        const kimaiProjects = await kimai.getProjects();
        const kimaiActivities = await kimai.getActivities();

        const stoppedTogglTimeEntries = togglTimeEntries.data.filter(t => t.stop !== null);

        if (stoppedTogglTimeEntries.length > 0) {
            for (const togglTimeEntry of stoppedTogglTimeEntries) {
                const togglTimeEntryStart = DateTime.fromISO(togglTimeEntry.start).toLocal();
                const togglTimeEntryStop = DateTime.fromISO(togglTimeEntry.stop!).toLocal();
                const togglTimeEntryDuration = Duration.fromMillis(togglTimeEntry.duration * 1000).toFormat("h:mm:ss");

                let togglTimeEntryProjectName = 'No project';
                let togglTimeEntryProjectColor = '#000000';

                if (togglTimeEntry.project_id) {
                    const togglTimeEntryProject = togglProjects.data.find(p => p.id === togglTimeEntry.project_id);
                    togglTimeEntryProjectColor = togglTimeEntryProject ? togglTimeEntryProject.color : '#000000';
                    togglTimeEntryProjectName = togglTimeEntryProject ? togglTimeEntryProject.name : `Unknown project (${togglTimeEntry.project_id})`;
                }

                console.log(chalk.cyan(`\n🕒 Toggl entry:\n`));
                console.log(`${chalk.bold(`${chalk.bgHex(togglTimeEntryProjectColor).black.bold(` ${togglTimeEntryProjectName} `)} ${togglTimeEntry.description || '(no description)'}`)}`);
                console.log(`📅 ${togglTimeEntryStart.toLocaleString(DateTime.DATE_MED)} ${togglTimeEntryStart.toLocaleString(DateTime.TIME_24_SIMPLE)} - ${togglTimeEntryStop ? `${togglTimeEntryStop.toLocaleString(DateTime.TIME_24_SIMPLE)} (${togglTimeEntryDuration})` : 'Running'}\n`);

                const { SELECTED_KIMAI_PROJECT_ID } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'SELECTED_KIMAI_PROJECT_ID',
                        message: 'Select a Kimai project to assign this entry to:',
                        choices: kimaiProjects.data.map(kimaiProject => ({
                            name: kimaiProject.name,
                            value: kimaiProject.id
                        }))
                    }
                ]);

                const availableActivities = kimaiActivities.data.filter(kimaiActivity => kimaiActivity.project === null || kimaiActivity.project === SELECTED_KIMAI_PROJECT_ID);

                const { SELECTED_KIMAI_ACTIVITY_ID } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'SELECTED_KIMAI_ACTIVITY_ID',
                        message: 'Select a Kimai activity for this entry:',
                        choices: availableActivities.map(a => ({
                            name: a.name,
                            value: a.id
                        }))
                    }
                ]);

                console.log(chalk.green(`\n✔ Toggl entry ${chalk.bgHex(togglTimeEntryProjectColor).black.bold(` ${togglTimeEntryProjectName} `)} ${chalk.bold(togglTimeEntry.description || '(no description)')} assigned to Kimai project ${chalk.bgHex("#ffd166").black.bold(` ${kimaiProjects.data.find(kimaiProject => kimaiProject.id === SELECTED_KIMAI_PROJECT_ID)?.name} `)} and activity ${chalk.bgHex("#06d6a0").black.bold(` ${availableActivities.find(a => a.id === SELECTED_KIMAI_ACTIVITY_ID)?.name} `)}\n`));

                const { confirm } = await inquirer.prompt([{
                    type: 'confirm',
                    name: 'confirm',
                    message: 'Do you want to import this entry into Kimai?',
                    default: true
                }]);

                if (confirm) {
                    await kimai.createTimeEntry({
                        begin: togglTimeEntry.start,
                        end: togglTimeEntry.stop!,
                        project: SELECTED_KIMAI_PROJECT_ID,
                        activity: SELECTED_KIMAI_ACTIVITY_ID,
                        description: togglTimeEntry.description
                    });

                    console.log(chalk.green(`\n✔ Entry imported successfully!`));
                } else {
                    console.log(chalk.yellow(`\n✖ Entry not imported.`));
                }
            }

            console.log(chalk.green(`\n✔ All entries processed!`));
        } else {
            console.log(chalk.yellow(`\n✖ No Toggl time entries found in the specified date range.`));
        }
    } catch (error) {
        console.error(chalk.red(`\n❌ An error occurred: ${error}`));
    }
})();
