import { type V1ObjectMeta } from '@kubernetes/client-node';

export interface User {
  metadata?: V1ObjectMeta,
  fullName?: string,
  identities?: string[],
}
