import { Command } from 'commander';

import { default as pipelines } from './pipelines/index.js';
import { default as pods } from './pods/index.js';

const cmd = new Command();

cmd
  .name('odc')
  .description('CLI to create or modify Kubernetes/OpenShift/ODC resources');

cmd.addCommand(pipelines);
cmd.addCommand(pods);

cmd.parse();
