import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import { isError, isErrorLike } from 'src/shared/types/guards';
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
      if (isErrorLike(connection)) {
        setError(connection.message);
      } else {
        setError('');
      }

      if (connection !== null && !isErrorLike(connection)) {
        const address = await connection.signer.getAddress();

        const balance = await connection.provider.getBalance(address);
        const formattedBalance = ethers.utils.formatEther(balance);
        user = { address, balance: formattedBalance };

        rerender();
      }
    })();
  }, [connection]);

  const onAuth = async () => {
    const metaMaskConnection = await connectMetaMask();

    if (isError(metaMaskConnection)) {
      setError(metaMaskConnection.message);
    } else {
      connection = metaMaskConnection;

      rerender();
    }
  };

  return { connection, user, error, onAuth };
};

export { useAuth };
