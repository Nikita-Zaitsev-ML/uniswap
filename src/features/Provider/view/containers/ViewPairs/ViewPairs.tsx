import { FC, useState } from 'react';
import { useTheme } from '@mui/material';
import { ethers } from 'ethers';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { Card, Box, Typography, Button } from 'src/shared/components';
import { Address } from 'src/shared/api/blockchain/types';
import { BigNumber } from 'src/shared/helpers/blockchain/numbers';

import { Pair } from '../../../types';
import { selectProvider, removeLiquidity } from '../../../redux/slice';
import { createStyles } from './ViewPairs.style';

type Props = {
  userAddress: Address;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  switchBtn?: { onClick: () => void };
};

const ViewPairs: FC<Props> = ({ signer, switchBtn }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [isDisabled, setIsDisabled] = useState(false);

  const {
    data: { pairs },
  } = useAppSelector(selectProvider);
  const pairsOfUser = pairs.filter((pair) =>
    new BigNumber(pair.userBalance).gt('0')
  );
  const dispatch = useAppDispatch();

  const makeHandleDeleteBtnClick = (pair: Pair) => () => {
    if (signer !== null) {
      setIsDisabled(true);

      dispatch(removeLiquidity({ pair, signer }));
    }
  };

  return (
    <Card
      css={styles.root()}
      content={{
        children: (
          <>
            <Box css={styles.header()}>
              <Typography css={styles.title()} component="h3" variant="body1">
                Мои пары
              </Typography>
              {switchBtn !== undefined && (
                <Button size="small" onClick={switchBtn.onClick}>
                  Добавить пару
                </Button>
              )}
            </Box>
            <Box css={styles.panel()}>
              {pairsOfUser.length === 0 ? (
                <Typography variant="body2" align="center">
                  У вас пока нет пар
                </Typography>
              ) : (
                pairsOfUser.map((pair) => (
                  <Box
                    css={styles.pair()}
                    key={pair.tokens.map(({ name }) => name).toString()}
                  >
                    <Typography
                      css={styles.pairTitle()}
                      component="h4"
                      variant="body1"
                    >
                      {`${pair.tokens.map(({ name }) => name).join(' + ')}:`}
                    </Typography>
                    <Typography css={styles.pairBalance()} variant="body2">
                      {new BigNumber(pair.userBalance).toFixed(pair.decimals)}
                    </Typography>
                    <Button
                      css={styles.pairDeleteBtn()}
                      size="small"
                      color="error"
                      onClick={makeHandleDeleteBtnClick(pair)}
                      disabled={isDisabled}
                    >
                      Удалить пару
                    </Button>
                  </Box>
                ))
              )}
            </Box>
          </>
        ),
      }}
    />
  );
};

export type { Props };

export { ViewPairs };
