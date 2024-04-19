import { Command } from 'commander';
import k8s, { V1Pod } from '@kubernetes/client-node';
import { parseFile } from '../utils/parse.js';
import colorize from '../utils/colorize.js';

interface Options {
  namespace: string;
  count: string;
}

const cmd = new Command();

cmd
  .name('create')
  .option('-n, --namespace <string>', '', 'loadtest')
  .option('-c, --count <number>', '', '10')
  .action(async (options: Options) => {
    console.log()
    console.log(`Will create ${colorize.number(options.count)} ${colorize.resourcePlural('pods')} ...`);
    console.log()

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const apiClient = kc.makeApiClient(k8s.CoreV1Api);

    const pod = (await parseFile('./src/pods/pod.yaml'))[0] as V1Pod;

    for (let i = 0; i < Number(options.count); i++) {
      const createdPod = (await apiClient.createNamespacedPod(options.namespace, pod)).body;
      console.log(colorize.resource(createdPod), 'created');
    }
  });

export default cmd;
