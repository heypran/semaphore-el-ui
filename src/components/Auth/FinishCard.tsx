import React, { useEffect } from 'react';

import { Box, styled, Typography } from '@mui/material';
import StepperCard from '../common/StepperCard';
import BaseButton from '@components/common/BaseButton';
import { StepperComponentPropsType } from './types';
import { useAuthProvider, ZkIdType } from './AuthContext';
// @ts-ignore
import { ZkIdentity } from '@libsem/identity';

import { useSemaphoreClientContract } from '@hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import { ElefriaSteps } from '@components/common/types';
import LinearLoader from '@components/LinearLoader';
import BaseSnackbar from '@components/common/BaseSnackbar';
import { genExternalNullifier } from '@test';
import semaphore from '@test/semaphore';

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

type FinishCardPropsType = StepperComponentPropsType & {};
enum RegistrationStatus {
  Processing = 'Processing request...',
  TransactionFailed = 'Error registering identity! Transaction failed!',
  Success = 'Registering identity successful!',
  Error = 'Error registering identity!',
}
function FinishCard(props: FinishCardPropsType): React.ReactElement {
  const { zkIdentity } = useAuthProvider();
  const [proofStatus, setProofStatus] = React.useState(
    RegistrationStatus.Processing,
  );
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [transaction, setTransaction] = React.useState<any | undefined>();
  const semaphoreClientContract = useSemaphoreClientContract();

  const { account } = useWeb3React();

  const registerCommitment = async (zkIdentity: ZkIdType) => {
    if (success) {
      return;
    }
    if (zkIdentity == null) {
      // this should not happen
      throw new Error('ZkId undefined!');
    }

    if (zkIdentity?.password == null) {
      return;
    }
    // try {
    //   if (!(await addPassword(zkIdentity))) {
    //     return;
    //   }
    // } catch (e) {
    //   return;
    // }

    const identity: typeof ZkIdentity = ZkIdentity.genFromSerialized(
      zkIdentity.serialized,
    );
    const identityCommitment = identity.genIdentityCommitment();
    // 0x000000168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb a
    // 608068753131596365777716379227000351436610461825981405646580126970315
    const password = genExternalNullifier(zkIdentity?.password);
    const nullifierHash = semaphore.genNullifierHash(
      password,
      identity.getNullifier(),
    );
    try {
      const tx = await semaphoreClientContract.methods
        .insertIdentityPasswordAsClient(
          identityCommitment,
          nullifierHash,
          BigInt(password).toString(),
        )
        .send({ from: account });



      // verify event
      if (tx.transactionHash) {
        // setHasRegistered(true);
        // setHasCheckedRegistration(true);
      } else if (!tx.transactionHash) {
        // show error
        setProofStatus(RegistrationStatus.TransactionFailed);
        return;
      }
      setTransaction(tx);
    } catch (e) {
      setProofStatus(RegistrationStatus.Error);
      
      setLoading(false);
    }

    setProofStatus(RegistrationStatus.Success);

    setSuccess(true);
    setLoading(false);
  };

  useEffect(() => {
    if (
      success ||
      transaction?.transactionHash ||
      loading ||
      proofStatus === RegistrationStatus.TransactionFailed
    ) {
      return;
    }
    if (zkIdentity == null || account == null) {
      // this should not happen
      throw new Error('Account not connected!');
    }
    setLoading(true);
    registerCommitment(zkIdentity);
  }, [success, account, zkIdentity, registerCommitment, loading]);

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
          <Box
            display="flex"
            flexDirection="column"
            flex={1}
            justifyContent="center"
          >
            <Title>{proofStatus}</Title>
            <LinearLoader isLoading={loading} />
          </Box>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box display="flex" sx={{ m: '16px 0' }}></Box>
            {success && (
              <BaseButton
                variant="contained"
                onClick={() => props.setActiveStep(ElefriaSteps.LoginRegister)}
              >
                Return to Login
              </BaseButton>
            )}
          </Box>
          <BaseSnackbar message="Success" severity="success" open={success} />
        </Box>
      }
    />
  );
}

export default FinishCard;
