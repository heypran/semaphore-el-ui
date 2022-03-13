import React from 'react';

import { Box } from '@mui/material';
import StepperCard from '../common/StepperCard';
import BaseButton from '@components/common/BaseButton';
import { StepperComponentPropsType } from './types';

import useAuth from '@hooks/useAuth';
import { ConnectorNames } from '@utils/web3react';
import { useWeb3React } from '@web3-react/core';
import { ElefriaSteps } from '@components/common/types';
import { initStorage } from '@utils/erezk/storage';
import { useDummyAuth } from '@components/DummyAppProvider';

type LoginRegisterPropsType = StepperComponentPropsType & {};

function LoginRegisterCard(props: LoginRegisterPropsType): React.ReactElement {
  initStorage();
  const { login } = useAuth();
  const { account } = useWeb3React();
  const { userId, logout } = useDummyAuth();
  return (
    <StepperCard
      title={'Elefria'}
      content={
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          flex={1}
        >
          <BaseButton
            variant="contained"
            sx={{ mb: '16px' }}
            disabled={account != null}
            onClick={() => login(ConnectorNames.Metamask)}
          >
            Connect Wallet
          </BaseButton>
          <BaseButton
            variant="contained"
            sx={{ mb: '16px' }}
            disabled={account == null || userId != null}
            onClick={() => props.setActiveStep(ElefriaSteps.Login)}
          >
            Login
          </BaseButton>
          <BaseButton
            variant="contained"
            sx={{ mb: '16px' }}
            onClick={() => props.setActiveStep(ElefriaSteps.Register)}
            disabled={account == null || userId != null}
          >
            Register
          </BaseButton>
          <BaseButton
            variant="contained"
            onClick={() => {
              logout();
            }}
            disabled={userId == null}
          >
            Logout
          </BaseButton>
        </Box>
      }
    />
  );
}

export default LoginRegisterCard;
