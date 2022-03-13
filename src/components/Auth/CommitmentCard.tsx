import React, { useEffect } from 'react';

import {
  Box,
  styled,
  Typography,
  FormGroup,
  Checkbox,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import StepperCard from '../common/StepperCard';
import BaseButton from '@components/common/BaseButton';
import { StepperComponentPropsType } from './types';
import BaseTextField from '@components/common/BaseTextField';
import { useAuthProvider, ZkIdType } from './AuthContext';
// @ts-ignore
import { ZkIdentity } from '@libsem/identity';
import { storeNewId } from '@utils/erezk/storage';
import { ElefriaSteps } from '@components/common/types';
import { useWeb3React } from '@web3-react/core';

const Warning = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  mb: '16px',
}));

type CommitmentCardPropsType = StepperComponentPropsType & {};

function CommitmentCard(props: CommitmentCardPropsType): React.ReactElement {
  const theme = useTheme();
  const [keysSecured, setKeysSecured] = React.useState<boolean>(false);
  const { zkIdentity, setZkIdentity } = useAuthProvider();

  const [password, setPassword] = React.useState<string>('');
  const { account } = useWeb3React();
  useEffect(() => {
    if (account == null) {
      props.setActiveStep(ElefriaSteps.LoginRegister);
    }
  }, [account]);

  useEffect(() => {
    if (zkIdentity) {
      return;
    }
    const identity: typeof ZkIdentity = new ZkIdentity();
    const { identityNullifier, identityTrapdoor } = identity.getIdentity();

    const zkId: ZkIdType = {
      idt: identityTrapdoor,
      nullifier: identityNullifier,
      serialized: identity.serializeIdentity(),
    };

    setZkIdentity(zkId);
    storeNewId(identity.serializeIdentity());
  }, [setZkIdentity, zkIdentity]);
  const handleContinue = () => {
    if (zkIdentity == null) {
      return;
    }

    setZkIdentity({
      ...zkIdentity,
      password: password === '' || password == null ? undefined : password,
    });
  };
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <StepperCard
      title={'Elefria'}
      content={
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          flex={1}
        >
          <Box display="flex" flexDirection="column">
            <BaseTextField
              sx={{ mb: '8px' }}
              label="IdentityTrap"
              disabled
              value={zkIdentity?.idt.toString(16) ?? ''}
              onCopyClick={() => {
                if (zkIdentity?.idt == null) {
                  return;
                }
                copyToClipboard(zkIdentity?.idt.toString(16));
              }}
            />
            <BaseTextField
              sx={{ mb: '8px' }}
              label="Nullifier"
              disabled
              value={zkIdentity?.nullifier.toString(16) ?? ''}
              onCopyClick={() => {
                if (zkIdentity?.nullifier == null) {
                  return;
                }
                copyToClipboard(zkIdentity?.nullifier.toString(16));
              }}
            />
            <BaseTextField
              sx={{ mb: '8px' }}
              label="Password"
              value={password}
              required
              type="password"
              showCopy={false}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Warning>
              {`Note: if you loose your any of these keys you may loose access to
              your id forever. \n( More Info link)`}
            </Warning>
            <Box display="flex" sx={{ m: '16px 0' }}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={keysSecured}
                      onClick={() => setKeysSecured(!keysSecured)}
                    />
                  }
                  label="I secured the above keys."
                  sx={{ color: theme.palette.text.primary }}
                />
              </FormGroup>
            </Box>
            <BaseButton
              variant="contained"
              disabled={!keysSecured}
              onClick={() => {
                handleContinue();
                props.setActiveStep(ElefriaSteps.CommitAndFinish);
              }}
            >
              Proceed
            </BaseButton>
          </Box>
        </Box>
      }
    />
  );
}

export default CommitmentCard;
