# CLI to create or modify Kubernetes/OpenShift/ODC resources

## Requirements

* Node.js 18.20+ (not 18.18) or 20.12+
* Deno and Bun might work as well (untested, feel free to give it a try)

## Commands

### Pods

```shell
./odc pods create -c 3 

Will create 3 pods ...

pod/nginx-rzv2x created
pod/nginx-gdwsq created
pod/nginx-jmdpd created
```

```shell
./odc pods delete -c 3

Will delete 3 of 140 pods...

Deleting pod/nginx-4p8bn...
Deleting pod/nginx-4z52j...
Deleting pod/nginx-52tft...
```

### Tekton

```shell
./odc pipelines create -p 2 -r 3

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

./odc pipelines delete

Will delete 10 of 30 pipelines and 10 of 100 pipelineruns...

Deleting pipelinerun.tekton.dev/pipeline-6hgkd-6rbv8...
Deleting pipelinerun.tekton.dev/pipeline-6hgkd-79gld...
Deleting pipelinerun.tekton.dev/pipeline-6hgkd-8w2jj...
...
Deleting pipeline.tekton.dev/pipeline-26747...
Deleting pipeline.tekton.dev/pipeline-4b6m4...
...
```

### Users

List all users

```shell
./odc users list

Found 2 users!

┌───────────────┬──────────────────────────────────────┬─────────────────┬─────────────────────┐
│ Resource name │ UID                                  │ Full name       │ Identities          │
├───────────────┼──────────────────────────────────────┼─────────────────┼─────────────────────┤
│ developer     │ 2e39da07-23fd-442e-b2f6-dcbd208df9b5 │ asd asdasd asda │ developer:developer │
├───────────────┼──────────────────────────────────────┼─────────────────┼─────────────────────┤
│ kubeadmin     │ beca1223-8fd4-4bd6-8f91-79ed350f6b72 │                 │ developer:kubeadmin │
└───────────────┴──────────────────────────────────────┴─────────────────┴─────────────────────┘
```

### User-settings

List all user settings and their users:

```shell
./odc user-settings list

Lookup user-settings in namespace openshift-console-user-settings...

Found 4 ConfigMaps with 2 user-settings.
Found 2 (OpenShift) Users.

┌────────────────────────────────────────────────────┬────────┬───────────────────────┐
│ ConfigMap name                                     │ Labels │ User                  │
├────────────────────────────────────────────────────┼────────┼───────────────────────┤
│ user-settings-2e39da07-23fd-442e-b2f6-dcbd208df9b5 │ OK     │ user found: developer │
├────────────────────────────────────────────────────┼────────┼───────────────────────┤
│ user-settings-beca1223-8fd4-4bd6-8f91-79ed350f6b72 │ OK     │ user found: kubeadmin │
└────────────────────────────────────────────────────┴────────┴───────────────────────┘
```

### Migrate user settings

* Add (optional) `console.openshift.io/user-settings` labels and annotations.
* `--clean-up` removes existing UserSettings if the user doesn't exist anymore!
* `--dry-run` runs the script and list all the ConfigMaps, Roles and RoleBindings that the script will remove

```shell
./odc us migrate --clean-up --dry-run

Lookup user-settings in namespace openshift-console-user-settings...

Found 4 ConfigMaps with 2 user-settings.
Found 2 (OpenShift) Users.

┌────────────────────────────────────────────────────┬────────┬───────────────────────┐
│ ConfigMap name                                     │ Labels │ User                  │
├────────────────────────────────────────────────────┼────────┼───────────────────────┤
│ user-settings-2e39da07-23fd-442e-b2f6-dcbd208df9b5 │ OK     │ user found: developer │
├────────────────────────────────────────────────────┼────────┼───────────────────────┤
│ user-settings-beca1223-8fd4-4bd6-8f91-79ed350f6b72 │ OK     │ user found: kubeadmin │
└────────────────────────────────────────────────────┴────────┴───────────────────────┘
```
