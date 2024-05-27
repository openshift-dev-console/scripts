import { Command } from 'commander';
import list from './list.js';

const cmd = new Command();

cmd.name('users').alias('user').alias('u');

cmd.addCommand(list);

export default cmd;
