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
  .option('-p, --pipelines <number>', '', '10')
  .option('-r, --pipelineruns <number>', '', '10')
  .action(async (options: Options) => {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    const apiClient = k8s.KubernetesObjectApi.makeApiClient(kc);

    const labelSelector = querystring.encode({
      'loadtest': 'true',
    });
    const pipelines = await apiClient.list(
      'tekton.dev/v1',
      'Pipeline',
      options.namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    );
    const pipelineRuns = await apiClient.list(
      'tekton.dev/v1',
      'PipelineRun',
      options.namespace,
      undefined,
      undefined,
      undefined,
      undefined,
      labelSelector,
    );

    const foundPipelines = pipelines.body.items.length;
    const foundPipelineRuns = pipelineRuns.body.items.length;
    const deletePipelines = options.all ? foundPipelines : Math.min(foundPipelines, Number(options.pipelines));
    const deletePipelineRuns = options.all ? foundPipelineRuns : Math.min(foundPipelineRuns, Number(options.pipelineruns));

    log()
    log(`
      Will delete ${options.all ? 'ALL ' : ''}
      ${colorize.number(deletePipelines)} of ${colorize.number(foundPipelines)} ${colorize.resourcePlural('pipelines')}
      and
      ${colorize.number(deletePipelineRuns)} of ${colorize.number(foundPipelineRuns)} ${colorize.resourcePlural('pipelineruns')}...
    `);
    log();

    for (const pipelineRun of pipelineRuns.body.items.slice(0, deletePipelineRuns)) {
      console.log(`Deleting ${colorize.resource(pipelineRun)}...`);
      await apiClient.delete(pipelineRun);
    }

    for (const pipeline of pipelines.body.items.slice(0, deletePipelines)) {
      console.log(`Deleting ${colorize.resource(pipeline)}...`);
      await apiClient.delete(pipeline);
    }
  });

export default cmd;
