# CLI to create a bunch of kubernetes resources

## Requirements

* Node.js 20 or newer, Deno and Bun but might work as well.

## Commands

### Pods

```shell
./loadtest pods create -c 3 

Will create 3 pods ...

pod/nginx-rzv2x created
pod/nginx-gdwsq created
pod/nginx-jmdpd created
```

```shell
./loadtest pods delete -c 3

Will delete 3 of 140 pods...

Deleting pod/nginx-4p8bn...
Deleting pod/nginx-4z52j...
Deleting pod/nginx-52tft...
```

### Tekton

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

```shell

➜ ~/git/openshift-dev-console/loadtests (main) ✗ ./loadtest pipelines delete

Will delete 10 of 30 pipelines and 10 of 100 pipelineruns...

Deleting pipelinerun.tekton.dev/pipeline-6hgkd-6rbv8...
Deleting pipelinerun.tekton.dev/pipeline-6hgkd-79gld...
Deleting pipelinerun.tekton.dev/pipeline-6hgkd-8w2jj...
...
Deleting pipeline.tekton.dev/pipeline-26747...
Deleting pipeline.tekton.dev/pipeline-4b6m4...
...
```
