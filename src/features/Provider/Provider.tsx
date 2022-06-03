import { FC, useEffect } from 'react';
import { ethers } from 'ethers';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { LinearProgress, Typography } from 'src/shared/components';
import { REQUEST_STATUS } from 'src/shared/helpers/redux';

import { getData, selectProvider } from './redux/slice';
import { Pools, Swap } from './view/containers';

type Props = {
  userAddress: string | '';
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  view: 'Pools' | 'Swap';
};

const Provider: FC<Props> = ({ userAddress, provider, signer, view }) => {
  const { status, shouldUpdateData, error } = useAppSelector(selectProvider);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const isAuth = provider !== null && userAddress !== '';

    if (isAuth && shouldUpdateData) {
      dispatch(
        getData({
          userAddress,
          provider,
        })
      );
    }
  }, [dispatch, provider, userAddress, shouldUpdateData]);

  switch (status) {
    case REQUEST_STATUS.idle:
    case REQUEST_STATUS.pending:
    case REQUEST_STATUS.fulfilled: {
      const isDisabled =
        status === REQUEST_STATUS.idle || status === REQUEST_STATUS.pending;
      const shouldDisplayProgress = status === REQUEST_STATUS.pending;

      switch (view) {
        case 'Pools': {
          return (
            <>
              {shouldDisplayProgress && <LinearProgress position="fixed-top" />}
              <Pools
                userAddress={userAddress}
                provider={provider}
                signer={signer}
                disabled={isDisabled}
              />
            </>
          );
        }
        case 'Swap': {
          return (
            <>
              {shouldDisplayProgress && <LinearProgress position="fixed-top" />}
              <Swap provider={provider} signer={signer} disabled={isDisabled} />
            </>
          );
        }
        default: {
          return null;
        }
      }
    }
    case REQUEST_STATUS.rejected: {
      return <Typography color="error">{error}</Typography>;
    }
    default: {
      return null;
    }
  }
};

export type { Props };

export { Provider };
