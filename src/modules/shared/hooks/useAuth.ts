import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { connectMetaMask } from 'src/shared/api/blockchain/utils';

let connection: {
  provider: ethers.providers.Web3Provider;
  signer: ethers.providers.JsonRpcSigner;
} | null = null;

let user: {
  address: string;
  balance: string;
} | null = null;

const useAuth = () => {
  const [renderFlag, setRenderFlag] = useState(false);
  const [error, setError] = useState('');

  const rerender = () => {
    if (renderFlag) {
      setRenderFlag(false);
    } else {
      setRenderFlag(true);
    }
  };

  useEffect(() => {
    (async () => {
      if (connection !== null) {
        const address = await connection.signer.getAddress();

        const balance = await connection.provider.getBalance('ethers.eth');
        const formattedBalance = `${ethers.utils.formatEther(balance)}`;

        user = { address, balance: formattedBalance };

        rerender();
      }
    })();
  }, [connection]);

  const handleHeaderOnAuth = async () => {
    if (connection !== null) {
      return;
    }

    const metaMaskConnection = await connectMetaMask();

    if (metaMaskConnection instanceof Error) {
      setError(metaMaskConnection.message);
    } else {
      connection = metaMaskConnection;

      rerender();
    }
  };

  return { connection, user, error, handleHeaderOnAuth };
};

export { useAuth };