import { Command } from 'commander';
import k8s from '@kubernetes/client-node';
import Table from 'cli-table3';
import colorize from '../utils/colorize.js';
import log from '../utils/log.js';
import type { User } from './types.js';

const cmd = new Command();

cmd
  .name('list')
  .alias('l')
  .alias('ls')
  .action(async () => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const genericApiClient = k8s.KubernetesObjectApi.makeApiClient(kc);
    const userResponse = await genericApiClient.list('user.openshift.io/v1', 'User');
    const users = userResponse.body.items as User[];

    log();
    log(`Found ${colorize.number(users.length)} users!`);
    log();

    const table = new Table({
      head: ['Resource name', 'UID', 'Full name', 'Identities'],
    });

    for (const user of users) {
      table.push([
        colorize.resourceName(user.metadata?.name),
        user.metadata?.uid,
        user.fullName,
        user.identities?.join(', '),
      ]);
    }

    console.log(table.toString());
  });

export default cmd;
