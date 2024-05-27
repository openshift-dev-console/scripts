import k8s from '@kubernetes/client-node';
import chalk from 'chalk';
import { getSingular } from './strings.js';

const colorize = {
  number: chalk.green,
  resourceSingular: chalk.blueBright,
  resourcePlural: chalk.blueBright,
  resourceName: chalk.yellowBright,
  resource: (object: k8s.KubernetesObject) =>
    colorize.resourceSingular(getSingular(object)) + '/' +
    colorize.resourceName(object.metadata?.name),

  success: chalk.greenBright,
  warning: chalk.yellowBright,
  failure: chalk.redBright,
};

export default colorize;
