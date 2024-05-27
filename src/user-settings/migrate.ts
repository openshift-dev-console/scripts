import { Command } from 'commander';
import k8s, { PatchUtils, V1ConfigMap } from '@kubernetes/client-node';
import Table from 'cli-table3';
import colorize from '../utils/colorize.js';
import log from '../utils/log.js';
import { isUserSettingsConfigMap } from './utils.js';
import { User } from '../users/types.js';

interface Options {
  namespace: string;
  cleanUp: boolean;
  dryRun: boolean;
}

const cmd = new Command();

const patchConfigMap = async (coreApiClient: k8s.CoreV1Api, configMap: V1ConfigMap, mergeConfigMap: V1ConfigMap): Promise<V1ConfigMap> => {
  const patchResponse = await coreApiClient.patchNamespacedConfigMap(
    configMap.metadata!.name!,
    configMap.metadata!.namespace!,
    mergeConfigMap,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    {
      headers: {
        'Content-Type': PatchUtils.PATCH_FORMAT_JSON_MERGE_PATCH,
      },
    },
  );
  return patchResponse.body;
};

cmd
  .name('migrate')
  .option('-n, --namespace <string>', '', 'openshift-console-user-settings')
  .option('--clean-up', '', false)
  .option('--dry-run', '', false)
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
      const user = uidToUser[configMapSuffix];

      if (configMapSuffix === 'kubeadmin') {
        if (!hasLabels) {
          log(`Add user-settings labels to ConfigMap ${colorize.resourceName(configMapName)}...`);
          await patchConfigMap(coreApiClient, configMap, {
            metadata: {
              labels: {
                'console.openshift.io/user-settings': 'true',
                'console.openshift.io/user-settings-uid': 'kubeadmin',
              },
              annotations: {
                'console.openshift.io/user-settings-username': 'kube:admin',
              },
            },
          });
        }

        table.push([
          colorize.resourceName(configMapName),
          hasLabels ? colorize.success('OK') : colorize.warning('Added'),
          colorize.resourceName('kube:admin'),
        ]);
        continue;
      }

      if (user) {
        if (!hasLabels) {
          log(`Add user-settings labels to ConfigMap ${colorize.resourceName(configMapName)}...`);
          await patchConfigMap(coreApiClient, configMap, {
            metadata: {
              labels: {
                'console.openshift.io/user-settings': 'true',
                'console.openshift.io/user-settings-uid': user.metadata!.uid!,
              },
              annotations: {
                'console.openshift.io/user-settings-username': user.metadata!.name!,
              },
            },
          });
        }
        table.push([
          colorize.resourceName(configMapName),
          hasLabels ? colorize.success('OK') : colorize.warning('Added'),
          colorize.success(`user found: ${colorize.resourceName(user?.metadata?.name)}`),
        ]);
        continue;
      }

      // Delete ConfigMap, Role and RoleBinding if clean-up is enabled and user isn't found.
      if (options.cleanUp) {
        const roleName = configMapName + '-role';
        const roleBindingName = configMapName + '-rolebinding';
        const authApiClient = kc.makeApiClient(k8s.RbacAuthorizationV1Api);
        const dryRun = options.dryRun ? 'All' : undefined;
        const dryRunPrefix = options.dryRun ? '[DRY-RUN] ' : '';

        try {
          log(`${dryRunPrefix}Delete ${colorize.resourceSingular('ConfigMap')} ${colorize.resourceName(configMapName)}...`);
          await coreApiClient.deleteNamespacedConfigMap(configMapName, options.namespace, undefined, dryRun);
        } catch (error: any) {
          console.error(`Failed to delete ${colorize.resourceSingular('ConfigMap')} ${colorize.resourceName(configMapName)}:`, error?.body?.message || error?.message || error);
        }

        try {
          log(`${dryRunPrefix}Delete ${colorize.resourceSingular('Role')} ${colorize.resourceName(roleName)}...`);
          await authApiClient.deleteNamespacedRole(roleName, options.namespace, undefined, dryRun);
        } catch (error: any) {
          console.error(`Failed to delete ${colorize.resourceSingular('Role')} ${colorize.resourceName(roleName)}:`, error?.body?.message || error?.message || error);
        }

        try {
          log(`${dryRunPrefix}Delete ${colorize.resourceSingular('RoleBinding')} ${colorize.resourceName(configMapName + '-rolebinding')}...`);
          await authApiClient.deleteNamespacedRoleBinding(roleBindingName, options.namespace, undefined, dryRun);
        } catch (error: any) {
          console.error(`Failed to delete ${colorize.resourceSingular('RoleBinding')} ${colorize.resourceName(roleBindingName)}:`, error?.body?.message || error?.message || error);
        }

        table.push([
          colorize.resourceName(configMapName),
          hasLabels ? colorize.warning('Exists before') : colorize.warning('Did not exist'),
          colorize.failure(`${dryRunPrefix}DELETED because user not found for uid: ${colorize.resourceName(configMapSuffix)}`),
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
