# CLI to create a bunch of kubernetes resources

## Requirements

* Node.js 20 or newer, Deno and Bun but might work as well.

## Commands

### Tekton

####  Pipelines with PipelineRuns

```shell
./loadtest pipelines create -p 2 -r 3

Will create 2 pipelines with 3 pipelineruns...

task.tekton.dev/hello configured
task.tekton.dev/goodbye configured
pipeline.tekton.dev/pipeline-4mfh9 created
pipeline.tekton.dev/pipeline-dtfjz created
pipelinerun.tekton.dev/pipeline-4mfh9-wsznt created
pipelinerun.tekton.dev/pipeline-4mfh9-h6d9s created
pipelinerun.tekton.dev/pipeline-4mfh9-kjzmc created
pipelinerun.tekton.dev/pipeline-dtfjz-5zmxr created
pipelinerun.tekton.dev/pipeline-dtfjz-khm72 created
pipelinerun.tekton.dev/pipeline-dtfjz-4jbn5 created
```
