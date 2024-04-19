import { Command } from 'commander';
import querystring from 'node:querystring';
import k8s from '@kubernetes/client-node';
import colorize from '../utils/colorize.js';
import log from '../utils/log.js';

interface Options {
  all: boolean;
  namespace: string;
  count: string;
}

const cmd = new Command();

cmd
  .name('delete')
  .option('-a, --all')
  .option('-n, --namespace <string>', '', 'loadtest')
  .option('-c, --count <number>', '', '10')
  .action(async (options: Options) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const apiClient = kc.makeApiClient(k8s.CoreV1Api);

    const labelSelector = querystring.encode({
      'loadtest': 'true',
    });
    const pods = await apiClient.listNamespacedPod(
      options.namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    );

    const found = pods.body.items.length;
    const deleteCount = options.all ? found : Math.min(found, Number(options.count));

    log()
    log(`
      Will delete ${options.all ? 'ALL ' : ''}
      ${colorize.number(deleteCount)} of ${colorize.number(found)} ${colorize.resourcePlural('pods')}...
    `);
    log();

    for (const pod of pods.body.items.slice(0, deleteCount)) {
      console.log(`Deleting ${colorize.resourceSingular('pod')}/${colorize.resourceName(pod.metadata!.name)}...`);
      await apiClient.deleteNamespacedPod(pod.metadata!.name!, pod.metadata!.namespace!);
    }
  });

export default cmd;
