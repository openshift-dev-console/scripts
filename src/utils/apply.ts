// Based on https://github.com/kubernetes-client/javascript/blob/master/examples/typescript/apply/apply-example.ts

import k8s from '@kubernetes/client-node';
import fs from 'node:fs/promises';
import * as yaml from 'js-yaml';
import { getPlural } from './strings.js';
import colorize from './colorize.js';

/**
 * Replicate the functionality of `kubectl apply`.
 * That is, create the resources defined in the `specFile` if they do
 * not exist, patch them if they do exist.
 */
export async function apply(
    api: k8s.KubernetesObjectApi,
    object: k8s.KubernetesObject,
): Promise<k8s.KubernetesObject> {
  // this is to convince the old version of TypeScript that metadata exists even though we already filtered specs
  // without metadata out
  object.metadata = object.metadata || {};
  object.metadata.annotations = object.metadata.annotations || {};
  delete object.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
  object.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(object);

  try {
    if (object.metadata.name) {
      // try to get the resource, if it does not exist an error will be thrown and we will end up in the catch
      // block.
      await api.read({
        apiVersion: object.apiVersion,
        kind: object.kind,
        metadata: {
          name: object.metadata.name,
          namespace: object.metadata.namespace!,
        },
      });

      // we got the resource, so it exists, so patch it
      //
      // Note that this could fail if the spec refers to a custom resource. For custom resources you may need
      // to specify a different patch merge strategy in the content-type header.
      //
      // See: https://github.com/kubernetes/kubernetes/issues/97423
      const updated = (await api.patch(
        object,
        undefined,
        undefined,
        undefined,
        undefined,
        {
          headers: {
            'Content-Type': 'application/merge-patch+json',
          },
        },
      )).body;
      console.log(colorize.resource(updated), 'configured');
      return updated;
    }
    const created = (await api.create(object)).body;
    console.log(colorize.resource(created), 'created');
  return created;
  } catch (e) {
    // we did not get the resource, so it does not exist, so create it
    const created = (await api.create(object)).body;
    console.log(colorize.resource(created), 'created');
  return created;
  }
}

export async function applyFile(
  api: k8s.KubernetesObjectApi,
  filename: string,
): Promise<k8s.KubernetesObject[]> {
  const content = await fs.readFile(filename, 'utf8');

  const parsedObjects = yaml.loadAll(content) as k8s.KubernetesObject[];
  const filteredObjects = parsedObjects.filter((o) => o?.kind && o?.metadata);

  // Apply all objects in a sequence
  const objects: k8s.KubernetesObject[] = [];
  for (const object of filteredObjects) {
    objects.push(await apply(api, object));
  }
  return objects;
}
