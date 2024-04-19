import { Command } from 'commander';

import { default as pipelines } from './pipelines/index.js';

const cmd = new Command();

cmd
  .name('loadtest')
  .description('CLI to create a bunch of kubernetes resources');

cmd.addCommand(pipelines);

cmd.parse();
