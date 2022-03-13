import React from 'react';

import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useWeb3React } from '@web3-react/core';

import useAuth from '@/hooks/useAuth';
import { ConnectorNames } from '@/utils/web3react';

function WalletConnect(): React.ReactElement {
  const { login, logout } = useAuth();
  const { account } = useWeb3React();
  return (
    <ListItem
      button
      onClick={() => (account ? logout : login(ConnectorNames.Metamask))}
    >
      <ListItemIcon>{account ? <LogoutIcon /> : <LoginIcon />}</ListItemIcon>
      <ListItemText primary={account ? 'Disconnect' : 'Connect'} />
    </ListItem>
  );
}

export default WalletConnect;
