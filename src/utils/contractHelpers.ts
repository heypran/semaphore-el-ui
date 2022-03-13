import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

import web3NoAccount from './web3';
import scAbi from '../../../semaphore-sol/artifacts/contracts/SemaphoreClient.sol/SemaphoreClient.json';
import semaphoreAbi from '../../../semaphore-sol/artifacts/contracts/Semaphore.sol/Semaphore.json';
import config from '../../exported_config.json';

const getContract = (abi: any, address: string, web3?: Web3) => {
  const _web3 = web3 ?? web3NoAccount;
  return new _web3.eth.Contract(abi as unknown as AbiItem, address);
};

export const getScContract = (web3?: Web3): any => {
  const contractAddr =
    process.env.NEXT_PUBLIC_ENV == 'prod'
      ? config.chain.mainnet.SemaphoreClient
      : config.chain.contracts.SemaphoreClient;
  console.log(contractAddr);
  return getContract(scAbi.abi, contractAddr, web3);
};

export const getSemContract = (web3?: Web3): any => {
  const contractAddr =
    process.env.NEXT_PUBLIC_ENV == 'prod'
      ? config.chain.mainnet.Semaphore
      : config.chain.contracts.Semaphore;
  console.log(contractAddr);

  return getContract(semaphoreAbi.abi, contractAddr, web3);
};
