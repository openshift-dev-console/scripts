import { Command } from 'commander';

import { default as pipelines } from './pipelines/index.js';
import { default as pods } from './pods/index.js';
import { default as users } from './users/index.js';
import { default as usersettings } from './user-settings/index.js';

const cmd = new Command();

cmd
  .name('odc')
  .description('CLI to create or modify Kubernetes/OpenShift/ODC resources');

cmd.addCommand(pipelines);
cmd.addCommand(pods);
cmd.addCommand(users);
cmd.addCommand(usersettings);

cmd.parse();
