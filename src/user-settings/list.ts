import { Command } from 'commander';
import k8s from '@kubernetes/client-node';
import Table from 'cli-table3';
import colorize from '../utils/colorize.js';
import log from '../utils/log.js';
import { isUserSettingsConfigMap } from './utils.js';
import { User } from '../users/types.js';

interface Options {
  namespace: string;
}

const cmd = new Command();

cmd
  .name('list')
  .alias('l')
  .alias('ls')
  .option('-n, --namespace <string>', '', 'openshift-console-user-settings')
  .action(async (options: Options) => {
    log();
    log(`Lookup user-settings in namespace ${colorize.resourceName(options.namespace)}...`);
    log();

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const coreApiClient = kc.makeApiClient(k8s.CoreV1Api);
    const configMapResponse = await coreApiClient.listNamespacedConfigMap(options.namespace);
    const configMaps = configMapResponse.body.items.filter(isUserSettingsConfigMap);
    log(`Found ${colorize.number(configMapResponse.body.items.length)} ${colorize.resourcePlural('ConfigMaps')} with ${colorize.number(configMaps.length)} user-settings.`);

    const genericApiClient = k8s.KubernetesObjectApi.makeApiClient(kc);
    const userResponse = await genericApiClient.list('user.openshift.io/v1', 'User');
    const users = userResponse.body.items as User[];
    log(`Found ${colorize.number(users.length)} (OpenShift) ${colorize.resourcePlural('Users')}.`);
    log();

    const uidToUser: Record<string, User> = {};
    for (const user of users) {
      uidToUser[user.metadata!.uid!] = user;
    }

    const table = new Table({
      head: ['ConfigMap name', 'Labels', 'User'],
    });

    for (const configMap of configMaps) {
      const configMapName = configMap.metadata!.name!;
      const configMapSuffix = configMapName.replace('user-settings-', '');

      const hasLabels = !!configMap.metadata?.labels?.['console.openshift.io/user-settings'];

      if (configMapSuffix === 'kubeadmin') {
        table.push([
          colorize.resourceName(configMapName),
          hasLabels ? colorize.success('OK') : colorize.failure('Missing'),
          colorize.resourceName('kube:admin'),
        ]);
        continue;
      }

      const user = uidToUser[configMapSuffix];
      if (user) {
        table.push([
          colorize.resourceName(configMapName),
          hasLabels ? colorize.success('OK') : colorize.failure('Missing'),
          colorize.success(`user found: ${colorize.resourceName(user?.metadata?.name)}`),
        ]);
        continue;
      }

      table.push([
        colorize.resourceName(configMapName),
        hasLabels ? colorize.success('OK') : colorize.failure('Missing'),
        colorize.failure(`user not found for uid: ${colorize.resourceName(configMapSuffix)}`),
      ]);
    }

    console.log(table.toString());
  });

export default cmd;
