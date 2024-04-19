import { Command } from 'commander';
import create from './create.js';

const cmd = new Command();

cmd
  .name('pipelines');

cmd.addCommand(create);

export default cmd;
