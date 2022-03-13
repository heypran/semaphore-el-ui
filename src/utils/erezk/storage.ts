import { ZkIdType } from './../../components/Auth/AuthContext';
import config from '../../../exported_config.json';
import * as bigintConversion from 'bigint-conversion';

function getStorage() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
}
const localStorage = getStorage();

// The storage key depends on the mixer contracts to prevent conflicts
const postfix = config.chain.contracts.SemaphoreClient.slice(2).toLowerCase();
const keyNew = `elefria_key_${postfix}`;

const initStorage = () => {
  if (!localStorage?.getItem(keyNew)) {
    localStorage?.setItem(keyNew, '');
  }
};

const storeNewId = (serializedId: string) => {
  localStorage?.setItem(keyNew, serializedId);
};
//@ts-ignore
const storeElefriaId = (zkId: ZkIdType) => {
  const data = {
    identityNullifier: zkId?.nullifier.toString(16),
    identityTrapdoor: zkId?.idt.toString(16),
    password: zkId?.password, //todo fix
  };
  localStorage?.setItem(keyNew, JSON.stringify(data));
};
//@ts-ignore
const retrieveElefriaId = (): ZkIdType => {
  let serialisedIdentity;
  try {
    serialisedIdentity = localStorage?.getItem(keyNew) ?? '';
    const data = JSON.parse(serialisedIdentity);
    if (!('identityNullifier' in data) || !('identityTrapdoor' in data)) {
      throw new Error('Wrong input identity');
    }
    return {
      nullifier: bigintConversion.hexToBigint(data['identityNullifier']),
      idt: bigintConversion.hexToBigint(data['identityTrapdoor']),
      password: data['password'],
      serialized: serialisedIdentity,
    };
  } catch (e) {}
};
const retrieveNewId = (): string => {
  return localStorage?.getItem(keyNew) ?? '';
};

const hasNewId = (): boolean => {
  const d = localStorage?.getItem(keyNew);
  return d != null && d.length > 0;
};

export { initStorage, storeNewId, retrieveNewId, hasNewId };
