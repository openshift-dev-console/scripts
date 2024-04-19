import k8s from '@kubernetes/client-node';
import chalk from 'chalk';
import { getPlural } from './strings.js';

const colorize = {
  number: chalk.green,
  resourcePlural: chalk.blueBright,
  resourceName: chalk.yellowBright,
  resource: (object: k8s.KubernetesObject) =>
    colorize.resourcePlural(getPlural(object)) + '/' +
    colorize.resourceName(object.metadata?.name),
};

export default colorize;
