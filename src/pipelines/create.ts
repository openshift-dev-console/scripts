import { Command } from 'commander';
import k8s from '@kubernetes/client-node';
import { applyFile } from '../utils/apply.js';
import { parseFile } from '../utils/parse.js';
import colorize from '../utils/colorize.js';

interface Options {
  namespace: string;
  pipelines: string;
  pipelineruns: string;
}

const cmd = new Command();

cmd
  .name('create')
  .option('-n, --namespace <string>', '', 'loadtest')
  .option('-p, --pipelines <number>', '', '10')
  .option('-r, --pipelineruns <number>', '', '10')
  .action(async (options: Options) => {

    console.log()
    console.log(`Will create ${colorize.number(options.pipelines)} ${colorize.resourcePlural('pipelines')} with ${colorize.number(options.pipelineruns)} ${colorize.resourcePlural('pipelineruns')}...`);
    console.log()

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const apiClient = k8s.KubernetesObjectApi.makeApiClient(kc);

    await applyFile(apiClient, './src/pipelines/tasks.yaml');

    const pipeline = (await parseFile(apiClient, './src/pipelines/pipeline.yaml'))[0];
    const pipelineRun = (await parseFile(apiClient, './src/pipelines/pipelinerun.yaml'))[0];

    const createdPipelines = [];
    for (let i = 0; i < Number(options.pipelines); i++) {
      delete pipeline.metadata!.name;
      pipeline.metadata!.namespace = options.namespace;
      pipeline.metadata!.generateName = 'pipeline-';
      pipeline.metadata!.labels = {
        ...pipeline.metadata!.labels,
        'loadtest': 'true',
      };

      const createdPipeline = (await apiClient.create(pipeline)).body;
      console.log(colorize.resource(createdPipeline), 'created');
      createdPipelines.push(createdPipeline);
    }

    for (let i = 0; i < Number(options.pipelines); i++) {
      const createdPipeline = createdPipelines[i];
      delete pipelineRun.metadata!.name;
      pipelineRun.metadata!.namespace = options.namespace;
      pipelineRun.metadata!.generateName = createdPipeline.metadata!.name + '-';
      pipeline.metadata!.labels = {
        ...pipeline.metadata!.labels,
        'loadtest': 'true',
      };

      (pipelineRun as any).spec.pipelineRef.name = createdPipeline.metadata!.name;
      for (let i = 0; i < Number(options.pipelineruns); i++) {
        const createdPipelinRun = (await apiClient.create(pipelineRun)).body;
        console.log(colorize.resource(createdPipelinRun), 'created');
      }
    }
  });

export default cmd;
