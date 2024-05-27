import { Command } from 'commander';
import list from './list.js';
import migrate from './migrate.js';

const cmd = new Command();

cmd.name('user-settings').alias('usersettings').alias('us');

cmd.addCommand(list);
cmd.addCommand(migrate);

export default cmd;
