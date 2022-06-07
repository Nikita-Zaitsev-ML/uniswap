import { ethers } from 'ethers';

import { ethereumNetworks } from '../constants';

declare global {
  interface Window {
    ethereum: any;
  }
}

const connectMetaMask = async () => {
  if (window?.ethereum === undefined) {
    window.alert('Пожалуйста, установите MetaMask');

    return new Error('ethereum is undefined');
  }

  if (Number(window.ethereum.networkVersion) !== ethereumNetworks.rinkeby.id) {
    window.alert('Пожалуйста, Выберите сеть rinkeby');

    return new Error("ethereum network isn't rinkeby");
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');

    await provider.send('eth_requestAccounts', []);

    const signer = provider.getSigner();

    provider.on('network', (newNetwork, oldNetwork) => {
      const isNetworkChanged = oldNetwork !== null;

      if (isNetworkChanged) {
        window.location.reload();
      }
    });

    return { provider, signer };
  } catch (error) {
    return <globalThis.Error>error;
  }
};

export { connectMetaMask };
