import { Command } from 'commander';
import create from './create.js';
import deleteCmd from './delete.js';

const cmd = new Command();

cmd
  .name('pods');

  cmd.addCommand(create);
  cmd.addCommand(deleteCmd);

export default cmd;
