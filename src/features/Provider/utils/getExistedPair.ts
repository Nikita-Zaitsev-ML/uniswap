import { Token, Pair } from '../types';

type Options = {
  tokenInAddress: string;
  tokenOutAddress: string;
  tokens: Token[];
  pairs: Pair[];
};

const getExistedPair = ({
  tokenInAddress,
  tokenOutAddress,
  tokens,
  pairs,
}: Options) => {
  const tokenInData = tokens.find(({ address }) => address === tokenInAddress);
  const tokenOutData = tokens.find(
    ({ address }) => address === tokenOutAddress
  );
  const existedPair = pairs.find(
    ({ tokens: [token0, token1] }) =>
      (token0.address === tokenInData?.address &&
        token1.address === tokenOutData?.address) ||
      (token1.address === tokenInData?.address &&
        token0.address === tokenOutData?.address)
  );

  return { tokenInData, tokenOutData, existedPair };
};

export { getExistedPair };
