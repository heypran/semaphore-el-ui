import { useEffect } from 'react';

import { ConnectorNames } from '@/utils/web3react';

import useAuth, { connectorLocalStorageKey } from './useAuth';

const _harmonyChainListner = async () =>
  new Promise<void>((resolve) =>
    Object.defineProperty(window, 'harmony', {
      get() {
        return this.one;
      },
      set(one) {
        this.one = one;

        resolve();
      },
    }),
  );

const useEagerConnect = () => {
  const { login } = useAuth();

  useEffect(() => {
    const connectorId = window.localStorage.getItem(
      connectorLocalStorageKey,
    ) as ConnectorNames;
    console.log(`connectorId found`, connectorId);
    if (connectorId) {
      console.log(`connectorId found`, connectorId);
      const isConnectorHarmony = connectorId === ConnectorNames.Metamask;
      const isHarmonyChainDefined = Reflect.has(window, 'Onewallet');

      // Currently BSC extension doesn't always inject in time.
      // We must check to see if it exists, and if not, wait for it before proceeding.
      if (isConnectorHarmony && !isHarmonyChainDefined) {
        _harmonyChainListner().then(() => login(connectorId));

        return;
      }

      login(connectorId);
    }
  }, [login]);
};

export default useEagerConnect;
