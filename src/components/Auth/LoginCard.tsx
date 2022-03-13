import React, { useEffect } from 'react';

import { Box, styled, Typography } from '@mui/material';
import * as ethers from 'ethers';
import StepperCard from '../common/StepperCard';
import BaseButton from '@components/common/BaseButton';
import { StepperComponentPropsType } from './types';
import BaseTextField from '@components/common/BaseTextField';
import { generateMerkleProof, genExternalNullifier, Semaphore } from '@test';
// @ts-ignore
import { ZkIdentity } from '@libsem/identity';
import {
  useSemaphoreClientContract,
  useSemaphoreContract,
} from '@hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import { hasNewId, retrieveNewId } from '@utils/erezk/storage';
import { generateBroadcastParams } from '@utils/erezk/zk';
import config from '../../../exported_config.json';
import { ElefriaSteps } from '@components/common/types';
import LinearLoader from '@components/LinearLoader';
import { useDummyAuth } from '@components/DummyAppProvider';

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

type LoginCardPropsType = StepperComponentPropsType & {
  loginUrl?: '';
};

const ZERO_VALUE = BigInt(
  ethers.utils.solidityKeccak256(
    ['bytes'],
    [ethers.utils.toUtf8Bytes('Semaphore')],
  ),
);
const LOGIN_URL =
  process.env.NEXT_PUBLIC_ENV === 'prod'
    ? config.loginUrlMainnet
    : config.loginUrl;
function LoginCard(props: LoginCardPropsType): React.ReactElement {
  const [proofStatus, setProofStatus] = React.useState(
    'Only enter password if you set it during registration. Otherwise, just SUBMIT.',
  );
  const semaphoreClientContract = useSemaphoreClientContract();
  const semaphoreContract = useSemaphoreContract();
  const [authToken, setAuthToken] = React.useState<string | undefined>();
  const [userPassword, setUserPassword] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const { account } = useWeb3React();

  const loginUrl = props.loginUrl ?? LOGIN_URL;
  const { setToken } = useDummyAuth();
  // const getExternalNullifiers = async (semaphoreContract: any) => {
  //   const firstEn = await semaphoreContract.methods.firstExternalNullifier
  //     .call()
  //     .call();
  //   const lastEn = await semaphoreContract.methods.lastExternalNullifier
  //     .call()
  //     .call();

  //   const ens: BigInt[] = [firstEn];
  //   let currentEn = firstEn;

  //   while (currentEn.toString() !== lastEn.toString()) {
  //     currentEn = await semaphoreContract.methods
  //       .getNextExternalNullifier(currentEn)
  //       .call();
  //     ens.push(currentEn);
  //   }

  //   return ens;
  // };

  // 0x0000004da1a5ea9a352bd8dedad7ad76a6b2e2d14db68f363efbb6991b4cd39f
  // 2092939426383706250791554793010524747624595945182008060768526195807135
  // 2092939426383706250791554793010524747624595945182008060768526195807135
  const createAuthRequest = async (identity: typeof ZkIdentity) => {
    if (userPassword == null || userPassword.length === 0) {
      return;
    }
    setLoading(true);
    const identityCommitment = identity.genIdentityCommitment();

  
    
    const password = genExternalNullifier(userPassword);
    const signal = '';

    const nullifierHash = Semaphore.genNullifierHash(
      password.toString(),
      identity.getNullifier(),
    );

    setProofStatus('Getting merkle leaves');

    const leaves = await semaphoreClientContract.methods
      .getIdentityCommitments()
      .call();

    setProofStatus('Generating witness');

    // TODO constants
    const merkleProof = generateMerkleProof(
      20,
      ZERO_VALUE,
      5,
      leaves,
      identityCommitment.toString(),
    );
    
    const witnessParams = Semaphore.genWitness(
      identity.getIdentity(),
      merkleProof,
      BigInt(password).toString(),
      signal,
    );

    const fullProof = await generateBroadcastParams({
      ...witnessParams,
    });


    const [a, b, c, input] = fullProof;

    const signalAsHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal));


    setProofStatus('Generating Auth Request');

    try {
      const authRequest = await semaphoreContract.methods
        .storeAuthRequest(
          signalAsHex,
          merkleProof.root,
          nullifierHash,
          BigInt(password).toString(),
          a,
          b,
          c,
          input,
        )
        .send({ from: account });
      
      if (!authRequest.transactionHash) {
        // show error
        return;
      }

      setAuthToken(authRequest.events.AuthRequestEvent.returnValues.authToken);
    } catch (e) {
      setProofStatus('Error in creating Auth Request!');
      
    }
  };
  // TODO use this at later stage
  //   useEffect(() => {
  //       // also check tx status , created etc..
  //     if (authToken) {
  //       return;
  //     }
  //     let identity: typeof ZkIdentity;
  //     if (hasNewId()) {
  //       // TODO encryption using password
  //       identity = ZkIdentity.genFromSerialized(retrieveNewId());
  //     } else {
  //       throw new Error('ZkId not found!');
  //     }

  //     if (account == null) {
  //       // this should not happen
  //       throw new Error('Account not connected!');
  //     }
  //     createAuthRequest(identity);
  //   }, [success, account, createAuthRequest]);

  useEffect(() => {
    if (authToken == null) {
      return;
    }
    let identity: typeof ZkIdentity;
    if (hasNewId()) {
      // TODO encryption using password
      identity = ZkIdentity.genFromSerialized(retrieveNewId());
    } else {
      throw new Error('ZkId not found!');
    }

    if (account == null) {
      // go to home
      props.setActiveStep(ElefriaSteps.LoginRegister);
    }
    const password = genExternalNullifier(userPassword);
    const nullifierHash = Semaphore.genNullifierHash(
      password,
      identity.getNullifier(),
    );
    
    // TODO use hook
    fetch(loginUrl, {
      method: 'POST',
      body: JSON.stringify({
        authToken,
        identity: nullifierHash.toString(),
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    })
      .then(async (response) => {
        setLoading(false);
        const { token, userId } = await response.json();
        setProofStatus('Authenticated!');
        setToken(token, userId);
        props.setActiveStep(0);
      })
      .then((json) => {});
  }, [authToken]);

  const sumbitRequest = () => {
    if (authToken) {
      return;
    }
    let identity: typeof ZkIdentity;

    if (hasNewId()) {
      // TODO encryption using password
      identity = ZkIdentity.genFromSerialized(retrieveNewId());
    } else {
      throw new Error('ZkId not found!');
    }

    if (account == null) {
      // this should not happen
      throw new Error('Account not connected!');
    }

    createAuthRequest(identity);
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
          <BaseTextField
            sx={{ mb: '8px' }}
            label="Password"
            required
            value={userPassword}
            type="password"
            showCopy={false}
            onChange={(e) => {
              setUserPassword(e.target.value);
            }}
          />
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
            <Box display="flex" sx={{ m: '16px 0' }}>
              <BaseButton variant="contained" onClick={() => sumbitRequest()}>
                Submit
              </BaseButton>
            </Box>
          </Box>
        </Box>
      }
    />
  );
}

export default LoginCard;
