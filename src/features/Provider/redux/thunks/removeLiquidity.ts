import { createAsyncThunk } from '@reduxjs/toolkit';
import { ethers } from 'ethers';

import { fetchWriteToRouter } from 'src/shared/api/blockchain/rinkeby/fetches/writeToRouter';
import { parseUnits } from 'src/shared/helpers/blockchain/numbers';
import { isError } from 'src/shared/types/guards';

import { Pair } from '../../types';

type Options = {
  pair: Pair;
  signer: ethers.Signer;
};

const removeLiquidity = createAsyncThunk(
  'Provider/removeLiquidity',
  async ({
    pair: { tokens, userBalance, decimals },
    signer,
  }: Options): Promise<void> => {
    const [token0, token1] = tokens;

    const txRouter = await fetchWriteToRouter({
      contractParameters: { signer },
      methods: {
        removeLiquidity: [
          token0.address,
          token1.address,
          parseUnits(userBalance, decimals),
        ],
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
