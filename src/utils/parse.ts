import k8s from '@kubernetes/client-node';
import fs from 'node:fs/promises';
import * as yaml from 'js-yaml';

export async function parseFile(filename: string): Promise<k8s.KubernetesObject[]> {
  const content = await fs.readFile(filename, 'utf8');

  const parsedObjects = yaml.loadAll(content) as k8s.KubernetesObject[];
  const filteredObjects = parsedObjects.filter((o) => o?.kind && o?.metadata);

  return filteredObjects;
}
