import React, { useEffect, useState } from 'react';

// @ts-ignore
import { ZkIdentity } from '@libsem/identity';

import { Box, Button, Typography } from '@mui/material';
import { useWeb3React } from '@web3-react/core';
import * as ethers from 'ethers';

import {
  initStorage,
  storeNewId,
  retrieveNewId,
  hasNewId,
} from '@/utils/erezk/storage';
import useAuth from '@/hooks/useAuth';
import CardComponent from '@components/common/Card';
import { ConnectorNames } from '@/utils/web3react';
import {
  useSemaphoreClientContract,
  useSemaphoreContract,
} from '@/hooks/useContract';
import { generateBroadcastParams } from '@/utils/erezk/zk';
import {
  Semaphore,
  generateMerkleProof,
  genExternalNullifier,
  genSignalHash,
} from '@/test';
import config from '../../../exported_config.json';

// const keccak256 = (plaintext: string) => {
//   return ethers.utils.solidityKeccak256(["string"], [plaintext]);
// };

const ZERO_VALUE = BigInt(
  ethers.utils.solidityKeccak256(
    ['bytes'],
    [ethers.utils.toUtf8Bytes('Semaphore')],
  ),
);

const Register = () => {
  initStorage();
  const { login, logout } = useAuth();
  const { account, active } = useWeb3React();
  console.log('account status:', account, ' : ', active);
  const [proofStatus, setProofStatus] = useState('');
  const [hasCheckedRegistration, setHasCheckedRegistration] = useState(false);
  const [selectedExternalNullifierIndex, setSelectedExternalNullifierIndex] =
    useState(0);
  //   const [newExternalNullifier, setNewExternalNullifier] = useState("");
  const [hasRegistered, setHasRegistered] = useState(false);
  const [externalNullifiers, setExternalNullifiers] = useState<any[]>([]);
  const [signalHistory, setSignalHistory] = useState<any[]>([]);

  // const context = useWeb3Context();

  const semaphoreClientContract = useSemaphoreClientContract();
  const semaphoreContract = useSemaphoreContract();
  let identity: typeof ZkIdentity;
  let serialisedIdentity: string;
  identity = new ZkIdentity();
  // storeNewId(identity.getIdentity());
  if (hasNewId()) {
    identity = ZkIdentity.genFromSerialized(retrieveNewId());
  } else {
    identity = new ZkIdentity();
    storeNewId(identity.serializeIdentity());
    serialisedIdentity = identity.serializeIdentity();
  }

  // serialisedIdentity = identity.serializeIdentity();

  const identityCommitment = identity.genIdentityCommitment();
  // console.log("typeof IC ", typeof identityCommitment);
  const getExternalNullifiers = async (semContract: any) => {
    const firstEn = await semContract.methods.firstExternalNullifier
      .call()
      .call();
    const lastEn = await semContract.methods.lastExternalNullifier
      .call()
      .call();

    const ens: BigInt[] = [firstEn];
    let currentEn = firstEn;

    while (currentEn.toString() !== lastEn.toString()) {
      currentEn = await semContract.methods
        .getNextExternalNullifier(currentEn)
        .call();
      ens.push(currentEn);
    }

    return ens;
  };

  const getContractData = async () => {
    // const semaphoreContract = await getSemaphoreContract(context);
    // const semaphoreClientContract = await getSemaphoreClientContract(context);

    if (!hasCheckedRegistration) {
      const leaves = await semaphoreClientContract.methods
        .getIdentityCommitments()
        .call();
      if (
        leaves
          .map((x: any) => x.toString())
          .indexOf(identityCommitment.toString()) > -1
      ) {
        setHasRegistered(true);
        setHasCheckedRegistration(true);
      }
    }

    if (externalNullifiers.length === 0) {
      console.log('here.....');
      const ens = await getExternalNullifiers(semaphoreContract);
      setExternalNullifiers(ens);
    }

    const signals: any[] = [];
    const nextSignalIndex = await semaphoreClientContract.methods
      .getNextSignalIndex()
      .call();

    for (let i = 0; i < nextSignalIndex; i++) {
      const signal = await semaphoreClientContract.methods
        .getSignalByIndex(i)
        .call();
      const en = await semaphoreClientContract.methods
        .getExternalNullifierBySignalIndex(i)
        .call();

      signals.push({ signal, en });
    }
    setSignalHistory(signals);
  };

  const handleRegisterBtnClick = async () => {
    const tx = await semaphoreClientContract.methods
      .insertIdentityAsClient(identityCommitment)
      .send({ from: account });
    if (tx.transactionHash) {
      setHasRegistered(true);
      setHasCheckedRegistration(true);
    }
  };

  const handleBroadcastBtnClick3 = async () => {
    const defaultExternalNullifier =
      externalNullifiers[selectedExternalNullifierIndex];

    // const defaultExternalNullifier = genExternalNullifier("test-voting");
    // @ts-ignore
    const signal = document.getElementById('signal').value;
    console.log(
      'Broadcasting "' + signal + '" to external nullifier',
      defaultExternalNullifier,
    );

    const identityCommitment = identity.genIdentityCommitment();

    const nullifierHash = Semaphore.genNullifierHash(
      defaultExternalNullifier,
      identity.getNullifier(),
    );

    setProofStatus('Downloading leaves');

    const leaves = await semaphoreClientContract.methods
      .getIdentityCommitments()
      .call();

    setProofStatus('Generating witness');

    console.log('signal-->', signal);
    console.log('identityCommitment-->', identityCommitment);
    console.log('leaves-->', leaves);
    console.log('semaphoreTreeDepth-->', config.chain.semaphoreTreeDepth);
    console.log('defaultExternalNullifier-->', defaultExternalNullifier);

    const merkleProof = generateMerkleProof(
      20,
      ZERO_VALUE,
      5,
      leaves,
      identityCommitment.toString(),
    );
    console.log('merkleProof', merkleProof);

    const witnessParams = Semaphore.genWitness(
      identity.getIdentity(),
      merkleProof,
      defaultExternalNullifier,
      signal,
    );

    console.log('witnessParams', witnessParams);

    const fullProof = await generateBroadcastParams({
      ...witnessParams,
    });

    console.log('fullProof', fullProof);

    const [a, b, c, input] = fullProof;

    // const verify = await semContract.methods
    //   .verifyThisProof(a, b, c, input)
    //   .send({ from: account });
    // console.log("verification", verify);

    // Skipping packing unpacking stuff
    // const solidityProof = Semaphore.packToSolidityProof(fullProof);
    // let packedProof;
    // try {
    //   packedProof = await semContract.methods
    //     .packProof(solidityProof.a, solidityProof.b, solidityProof.c)
    //     .call({ from: account });
    //   console.log("packedProof", packedProof);
    // } catch (e) {
    //   console.log(`packProof, E:${e}`);
    // }

    setProofStatus('PreBroadcastCheck');
    const signalAsHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal));
    try {
      const preBroadcastCheck = await semaphoreContract.methods
        .preBroadcastCheck(
          signalAsHex,
          merkleProof.root,
          nullifierHash,
          genSignalHash(signal),
          defaultExternalNullifier,
        )
        .send({ from: account });
      console.log('preBroadcastCheck', preBroadcastCheck);
      if (!preBroadcastCheck.transactionHash) {
        // show error
        return;
      }
    } catch (e) {
      console.log(`preBroadcastCheck, E:${e}`);
    }

    setProofStatus('Broadcasting signal');
    try {
      const broadcastSignal = await semaphoreClientContract.methods
        .broadcastSignal(
          signalAsHex,
          merkleProof.root,
          nullifierHash,
          defaultExternalNullifier,
          a,
          b,
          c,
          input,
        )
        .send({ from: account });
      console.log(`broadcastSignal`, broadcastSignal);
      if (!broadcastSignal.transactionHash) {
        // show error
        return;
      }
    } catch (e) {
      console.log(`broadcastSignal, E:${e}`);
    }

    setProofStatus('Verifying....');
    const checkIfNullifierUsed = await semaphoreContract.methods
      .checkIfNullifierUsed(nullifierHash)
      .call();
    console.log(
      `checkIfNullifierUsed===>`,
      checkIfNullifierUsed,
      ':',
      nullifierHash,
    );
    // const nullifierHash = Semaphore.genNullifierHash(
    //   defaultExternalNullifier,
    //   identity.getNullifier(),
    //   20
    // );

    // const broadcastSignlParam = await generateBroadcastParams({
    //   signal_hash: result.signalHash,
    //   external_nullifier: BigInt(en.toString()),
    //   identity_nullifier: identity.identityNullifier,
    //   identity_trapdoor: identity.identityTrapdoor,
    //   identity_path_index: result.identityPathIndex,
    //   path_elements: result.identityPathElements,
    // });
    // //const witness = result.witness;
    // console.log("broadcastSignlParam", broadcastSignlParam);

    // setProofStatus("Generating proof");
    // console.log("Generating proof");
    // //@ts-ignore
    // const proof = await genProof(witness, provingKey);

    // setProofStatus("Broadcasting signal");

    // const publicSignals = genPublicSignals(witness, circuit);
    // const params = genBroadcastSignalParams(result, proof, publicSignals);
    // const tx = await semaphoreClientContract.broadcastSignal(
    //   ethers.utils.toUtf8Bytes(signal),
    //   params.proof,
    //   params.root,
    //   params.nullifiersHash,
    //   en.toString(),
    //   { gasLimit: 1000000 }
    // );

    // const receipt = await tx.wait();

    // console.log(receipt);
    // if (receipt.status === 1) {
    //   // @ts-ignore
    //   document.getElementById("signal").value = "";
    //   setProofStatus("");
    // } else {
    //   setProofStatus(
    //     "Transaction failed. Try signalling to a different external nullifier or use a fresh identity."
    //   );
    // }
  };

  const storeAuthRequest = async () => {
    const defaultExternalNullifier =
      externalNullifiers[selectedExternalNullifierIndex];

    const password = genExternalNullifier('test-voting');
    console.log(`password,`, password);
    // @ts-ignore
    const signal = document.getElementById('signal').value;
    console.log(
      'Broadcasting "' + signal + '" to external nullifier',
      defaultExternalNullifier,
    );
    console.log('typeof nullifier', typeof defaultExternalNullifier);
    const identityCommitment = identity.genIdentityCommitment();

    const nullifierHash = Semaphore.genNullifierHash(
      password,
      identity.getNullifier(),
    );
    console.log('nullifier ahs', nullifierHash);
    setProofStatus('Downloading leaves');

    const leaves = await semaphoreClientContract.methods
      .getIdentityCommitments()
      .call();

    setProofStatus('Generating witness');

    console.log('signal-->', signal);
    console.log('identityCommitment-->', identityCommitment);
    console.log('leaves-->', leaves);
    console.log('semaphoreTreeDepth-->', config.chain.semaphoreTreeDepth);
    console.log('defaultExternalNullifier-->', defaultExternalNullifier);

    const merkleProof = generateMerkleProof(
      20,
      ZERO_VALUE,
      5,
      leaves,
      identityCommitment.toString(),
    );
    console.log('merkleProof', merkleProof);

    const witnessParams = Semaphore.genWitness(
      identity.getIdentity(),
      merkleProof,
      defaultExternalNullifier,
      signal,
    );

    console.log('witnessParams', witnessParams);

    const fullProof = await generateBroadcastParams({
      ...witnessParams,
    });

    console.log('fullProof', fullProof);

    const [a, b, c, input] = fullProof;

    setProofStatus('Pre Auth Request Check');
    const signalAsHex = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal));
    // try {
    //   const preBroadcastCheck = await semaphoreContract.methods
    //     .preBroadcastCheck(
    //       signalAsHex,
    //       merkleProof.root,
    //       nullifierHash,
    //       genSignalHash(signal),
    //       defaultExternalNullifier,
    //     )
    //     .send({ from: account });
    //   console.log('preBroadcastCheck', preBroadcastCheck);
    //   if (!preBroadcastCheck.transactionHash) {
    //     // show error
    //     return;
    //   }
    // } catch (e) {
    //   console.log(`preBroadcastCheck, E:${e}`);
    // }

    setProofStatus('Generating Auth Request');
    try {
      const authRequest = await semaphoreContract.methods
        .storeAuthRequest(
          signalAsHex,
          merkleProof.root,
          nullifierHash,
          defaultExternalNullifier,
          a,
          b,
          c,
          input,
        )
        .send({ from: account });
      console.log(`broadcastSignal`, authRequest);
      if (!authRequest.transactionHash) {
        // show error
        return;
      }
    } catch (e) {
      console.log(`broadcastSignal, E:${e}`);
    }

    setProofStatus('Verifying....');
    const checkIfNullifierUsed = await semaphoreContract.methods
      .checkIfNullifierUsed(nullifierHash)
      .call();
    console.log(
      `checkIfNullifierUsed===>`,
      checkIfNullifierUsed,
      ':',
      nullifierHash,
    );
    // const nullifierHash = Semaphore.genNullifierHash(
    //   defaultExternalNullifier,
    //   identity.getNullifier(),
    //   20
    // );

    // const broadcastSignlParam = await generateBroadcastParams({
    //   signal_hash: result.signalHash,
    //   external_nullifier: BigInt(en.toString()),
    //   identity_nullifier: identity.identityNullifier,
    //   identity_trapdoor: identity.identityTrapdoor,
    //   identity_path_index: result.identityPathIndex,
    //   path_elements: result.identityPathElements,
    // });
    // //const witness = result.witness;
    // console.log("broadcastSignlParam", broadcastSignlParam);

    // setProofStatus("Generating proof");
    // console.log("Generating proof");
    // //@ts-ignore
    // const proof = await genProof(witness, provingKey);

    // setProofStatus("Broadcasting signal");

    // const publicSignals = genPublicSignals(witness, circuit);
    // const params = genBroadcastSignalParams(result, proof, publicSignals);
    // const tx = await semaphoreClientContract.broadcastSignal(
    //   ethers.utils.toUtf8Bytes(signal),
    //   params.proof,
    //   params.root,
    //   params.nullifiersHash,
    //   en.toString(),
    //   { gasLimit: 1000000 }
    // );

    // const receipt = await tx.wait();

    // console.log(receipt);
    // if (receipt.status === 1) {
    //   // @ts-ignore
    //   document.getElementById("signal").value = "";
    //   setProofStatus("");
    // } else {
    //   setProofStatus(
    //     "Transaction failed. Try signalling to a different external nullifier or use a fresh identity."
    //   );
    //
  };
  // 9420056963821217686523361891870851248647136491408587131206212888092074846317
  // 9420056963821217686523361891870851248647136491408587131206212888092074846317
  const validateAuthToken = async () => {
    // const token =
    //   "103827046288311438368120127272652646907354410598685519489397307167586480512233";
    const toekn2 =
      '101335200369752050058004044383245908045633737692222884379000502645056539170346';
    const validate = await semaphoreContract.methods
      .verifyAuthToken(toekn2)
      .call();
    console.log(validate);
  };

  const handleExternalNullifierSelect = (i: number) => {
    setSelectedExternalNullifierIndex(i);
  };

  const renderExternalNullifiers = () => {
    return (
      <Box display="flex" flexDirection="column">
        {externalNullifiers.map((x: any, i: number) => {
          return (
            <p key={i}>
              <label className="radio">
                <input
                  type="radio"
                  name="externalNullifier"
                  checked={selectedExternalNullifierIndex === i}
                  onChange={() => handleExternalNullifierSelect(i)}
                />
                {x.toString(16)}
              </label>
            </p>
          );
        })}
      </Box>
    );
  };

  const handleReplaceBtnClick = async () => {
    const newIdentity = new ZkIdentity();
    storeNewId(newIdentity.serializeIdentity());
    serialisedIdentity = newIdentity.serializeIdentity();
    setHasRegistered(false);
  };

  const handleAddExternalNullifierClick = async () => {
    // @ts-ignore
    const externalNullifier = document.getElementById(
      'newExternalNullifier',
      // @ts-ignore
    ).value;
    if (externalNullifier.length > 0) {
      // const semaphoreClientContract = await getSemaphoreClientContract(scContact,);

      const hash = genExternalNullifier(externalNullifier);
      console.log(`account`, account);
      console.log(`EN hash`, hash);
      const tx = await semaphoreContract.methods
        .addExternalNullifier(hash)
        .send({ from: account, gas: 300000 });
      // const receipt = await tx.wait();

      console.log(tx);

      if (tx.transactionHash) {
        // const semaphoreContract = await getSemaphoreContract(context);
        const ens = await getExternalNullifiers(semaphoreContract);
        console.log(`ens------>`, ens);
        setExternalNullifiers(ens);
        // @ts-ignore
        document.getElementById('newExternalNullifier').value = '';
      }
    }
  };

  const renderSignalHistory = () => {
    return (
      <table className="table">
        <thead>
          <tr>
            <td>External nullifier</td>
            <td>Signal</td>
          </tr>
        </thead>
        <tbody>
          {signalHistory.map((x, i) => {
            return (
              <tr key={i}>
                <td>{x.en.toString()}</td>
                <td>{x.signal.toString()}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  useEffect(() => {
    if (active) {
      getContractData();
    }
  }, [active]);

  let selectedEnToDisplay;

  if (externalNullifiers.length > 0) {
    selectedEnToDisplay = externalNullifiers[selectedExternalNullifierIndex]
      .toString(16)
      .slice(0, 8);
  }

  return (
    <div className="section">
      <div className="container" style={{ textAlign: 'right' }}>
        {/* <WalletWidget /> */}
      </div>
      <CardComponent />
      <hr />

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <Typography>
            Using zero-knowledge proofs, Semaphore allows you to broadcast an
            arbitary string without revealing your identity, but only the fact
            that you are part of the set of registered identities. You may only
            broadcast once per external nullifier. To broadcast more than once,
            you must either select (or add) a new external nullifier, or
            register a new identity. In real-world use, a Semaphore client
            should use a relayer to pay the gas on behalf of the signaller to
            further preserve their anonymity.
          </Typography>
        </div>
      </div>
      <div>
        <Button onClick={() => login(ConnectorNames.Metamask)}>Login</Button>
        <Button className="button is-success" onClick={logout}>
          Logout
        </Button>
        <Button className="button is-success" onClick={storeAuthRequest}>
          Auth Request
        </Button>
        <Button className="button is-success" onClick={validateAuthToken}>
          Validate Token
        </Button>
      </div>
      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Register your identity</h2>

          <p>
            <label>Your identity (saved in localStorage):</label>
          </p>

          <br />

          <textarea
            className="identityTextarea"
            // @ts-ignore
            value={serialisedIdentity}
            readOnly={true}
          />

          <br />
          {hasCheckedRegistration && hasRegistered ? (
            <p>You have registered your identity.</p>
          ) : (
            <Button
              className="button is-success"
              onClick={handleRegisterBtnClick}
            >
              Register
            </Button>
          )}
          <br />

          {hasCheckedRegistration && hasRegistered && (
            <Button
              className="button is-warning"
              onClick={handleReplaceBtnClick}
            >
              Replace identity
            </Button>
          )}
        </div>
      </div>

      <hr />

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Select an external nullifier</h2>

          {externalNullifiers.length > 0 && renderExternalNullifiers()}

          <br />

          <p>
            Add a new external nullifier (the last 29 bytes of the Keccak256
            hash of what you type will be used):
          </p>

          <br />

          <input
            id="newExternalNullifier"
            type="text"
            className="input"
            placeholder="Plaintext"
          />

          <br />
          <br />

          <Button
            className="button is-primary"
            onClick={handleAddExternalNullifierClick}
          >
            Hash plaintext and add external nullifier
          </Button>
        </div>
      </div>

      {!hasRegistered && (
        <div className="columns">
          <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
            <p>You must first register to broadcast a signal.</p>
          </div>
        </div>
      )}

      <hr />

      {hasRegistered && (
        <div className="columns">
          <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
            <h2 className="subtitle">Broadcast a signal</h2>

            {externalNullifiers.length > 0 && (
              <div>
                <p>
                  Broadcasting to external nullifier {selectedEnToDisplay}….
                  This can only happen once per registered identity.
                </p>
                <br />
              </div>
            )}

            {proofStatus.length > 0 && (
              <div>
                <pre>{proofStatus}</pre>
                <br />
                <br />
              </div>
            )}

            <input
              id="signal"
              type="text"
              className="input"
              placeholder="Signal"
            />

            <br />
            <br />

            <Button
              className="button is-success"
              onClick={handleBroadcastBtnClick3}
            >
              Broadcast
            </Button>
          </div>
        </div>
      )}

      <div className="columns">
        <div className="column is-12-mobile is-8-desktop is-offset-2-desktop">
          <h2 className="subtitle">Signal history</h2>
          {renderSignalHistory()}
        </div>
      </div>
    </div>
  );
};

export default Register;
