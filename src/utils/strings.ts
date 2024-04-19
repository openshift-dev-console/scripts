import k8s from '@kubernetes/client-node';

export function getPlural(object: k8s.KubernetesObject) {
  return object.kind!.toLowerCase() + '.' + object.apiVersion!.split('/')[0];
}
