import { Command } from 'commander';
import querystring from 'node:querystring';
import k8s from '@kubernetes/client-node';
import colorize from '../utils/colorize.js';
import log from '../utils/log.js';

interface Options {
  all: boolean;
  namespace: string;
  pipelines: string;
  pipelineruns: string;
}

const cmd = new Command();

cmd
  .name('delete')
  .option('-a, --all', 'delete all pipelines and pipelineruns')
  .option('-n, --namespace <string>', '', 'loadtest')
  .option('-c, --count <number>', '', '10')
  .action(async (options: Options) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const apiClient = k8s.KubernetesObjectApi.makeApiClient(kc);

    const labelSelector = querystring.encode({
      'loadtest': 'true',
    });
    const pods = await apiClient.list(
      'v1',
      'Pod',
      options.namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    );

    const found = pods.body.items.length;
    const deleteCount = options.all ? found : Math.min(found, Number(options.pipelines));

    log()
    log(`
      Will delete ${options.all ? 'ALL ' : ''}
      ${colorize.number(deleteCount)} of ${colorize.number(found)} ${colorize.resourcePlural('pipelines')}...
    `);
    log();

    for (const pod of pods.body.items.slice(0, deleteCount)) {
      console.log(`Deleting ${colorize.resource(pod)}...`);
      await apiClient.delete(pod);
    }
  });

export default cmd;
