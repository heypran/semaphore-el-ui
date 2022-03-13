import { useCallback } from 'react';

import { useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import { UserRejectedRequestError as UserRejectedRequestErrorInjected } from '@web3-react/injected-connector';
import {
  UserRejectedRequestError as UserRejectedRequestErrorWalletConnect,
  WalletConnectConnector,
} from '@web3-react/walletconnect-connector';

import { setupNetwork } from '@/utils/wallet';

import { ConnectorNames, connectorsByName } from '../utils/web3react';

export const connectorLocalStorageKey = 'connectorId';

const useAuth = () => {
  const { activate, deactivate } = useWeb3React();
  // const { toastError } = useToast()

  const login = useCallback((connectorID: ConnectorNames) => {
    const connector = connectorsByName[connectorID];

    if (connector) {
      activate(connector, async (error: Error) => {
        if (error instanceof UnsupportedChainIdError) {
          const hasSetup = await setupNetwork();
          if (hasSetup) {
            activate(connector);
          }
        } else {
          window.localStorage.removeItem(connectorLocalStorageKey);

          if (error) {
            console.log('Provider Error', 'No provider was found');
          } else if (
            //@ts-ignore
            error instanceof UserRejectedRequestErrorInjected ||
            //@ts-ignore
            error instanceof UserRejectedRequestErrorWalletConnect
          ) {
            if (connector instanceof WalletConnectConnector) {
              const walletConnector = connector as WalletConnectConnector;
              walletConnector.walletConnectProvider = null;
            }
            console.log(
              'Authorization Error',
              'Please authorize to access your account',
            );
          } else {
            //@ts-ignore
            console.log(error.name, error.message);
          }
        }
      });
    } else {
      console.log("Can't find connector", 'The connector config is wrong');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = useCallback(() => {
    deactivate();
  }, [deactivate]);

  return { login, logout };
};

export default useAuth;
