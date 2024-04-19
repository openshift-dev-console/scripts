import k8s from '@kubernetes/client-node';

export function getSingular(object: k8s.KubernetesObject) {
  if (object.apiVersion?.includes('/')) {
    return object.kind?.toLowerCase() + '.' + object.apiVersion.split('/')[0];
  } else {
    return object.kind?.toLowerCase();
  }
}

export function getPlural(object: k8s.KubernetesObject) {
  if (object.apiVersion?.includes('/')) {
    return object.kind?.toLowerCase() + '.s' + object.apiVersion.split('/')[0];
  } else {
    return object.kind?.toLowerCase() + 's';
  }
}
