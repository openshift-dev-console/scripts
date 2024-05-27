import { type V1ConfigMap } from '@kubernetes/client-node';

export function isUserSettingsConfigMap(configMap: V1ConfigMap): boolean {
  return configMap.metadata!.name!.startsWith('user-settings-');
}
