import { Command } from 'commander';
import k8s from '@kubernetes/client-node';
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

    const apiClient = k8s.KubernetesObjectApi.makeApiClient(kc);

    const pod = (await parseFile(apiClient, './src/pods/pod.yaml'))[0];

    pod.metadata = {
      ...pod.metadata,
      namespace :options.namespace,
      name: undefined,
      generateName: pod.metadata!.name + '-',
      labels: {
        ...pod.metadata!.labels,
        'loadtest': 'true',
      },
    };

    for (let i = 0; i < Number(options.count); i++) {
      const createdPod = (await apiClient.create(pod)).body;
      console.log(colorize.resource(createdPod), 'created');
    }
  });

export default cmd;
