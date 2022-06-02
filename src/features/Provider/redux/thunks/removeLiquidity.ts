import { createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

import { fetchWriteToRouter } from 'src/shared/api/blockchain/rinkeby/fetches/writeToRouter';
import { Address } from 'src/shared/api/blockchain/types';
import { isError } from 'src/shared/types/guards';

type Options = {
  token0: Address;
  token1: Address;
  amountLP: ethers.BigNumber;

  signer: ethers.Signer;
};

const removeLiquidity = createAsyncThunk(
  'Provider/removeLiquidity',
  async ({
    token0,
    token1,
    amountLP,

    signer,
  }: Options): Promise<void> => {
    const txRouter = await fetchWriteToRouter({
      contractParameters: { signer },
      methods: {
        removeLiquidity: [token0, token1, amountLP],
      },
    });

    if (isError(txRouter)) {
      return Promise.reject(txRouter);
    }

    await txRouter.removeLiquidity.wait();

    return undefined;
  }
);

export { removeLiquidity };
