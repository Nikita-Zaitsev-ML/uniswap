import { FC, useState } from 'react';
import { useTheme } from '@mui/material';
import { ethers } from 'ethers';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import {
  Card,
  Box,
  Typography,
  Button,
  WifiProtectedSetup,
} from 'src/shared/components';
import { Address } from 'src/shared/api/blockchain/types';
import { BigNumber, parseUnits } from 'src/shared/helpers/blockchain/numbers';

import { Pair } from '../../../types';
import { selectProvider, removeLiquidity } from '../../../redux/slice';
import { isDisabled } from '../../../utils';
import { createStyles } from './ViewPairs.style';
import { MaskedDecimalField } from '../../components/MaskedDecimalField/MaskedDecimalField';

type Props = {
  userAddress: Address;
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  switchBtn?: { onClick: () => void };
};

const ViewPairs: FC<Props> = ({ signer, switchBtn }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [withdraw, setWithdraw] = useState<{ [pairAddress: string]: string }>(
    {}
  );

  const {
    data: { pairs },
    status,
    shouldUpdateData,
  } = useAppSelector(selectProvider);
  const pairsOfUser = pairs.filter((pair) =>
    new BigNumber(pair.userBalance).decimalPlaces(5).gt('0')
  );
  const dispatch = useAppDispatch();

  const makeHandleDecimalFieldChange =
    (
      pairAddress: string
    ): Parameters<typeof MaskedDecimalField>['0']['onValueChange'] =>
    ({ value }) => {
      setWithdraw({ ...withdraw, [pairAddress]: value });
    };

  const makeHandleDeleteBtnClick = (pair: Pair) => () => {
    if (signer !== null) {
      const { tokens } = pair;
      const [token0, token1] = tokens;

      dispatch(
        removeLiquidity({
          token0: token0.address,
          token1: token1.address,
          amountLP: parseUnits(withdraw[pair.address], pair.decimals),
          signer,
        })
      );

      setWithdraw({ ...withdraw, [pair.address]: '' });
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
                <Button
                  size="small"
                  endIcon={<WifiProtectedSetup />}
                  disabled={isDisabled(status, shouldUpdateData)}
                  onClick={switchBtn.onClick}
                >
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
                      {new BigNumber(pair.userBalance)
                        .decimalPlaces(5)
                        .toString()}
                    </Typography>
                    <MaskedDecimalField
                      css={styles.pairDecimalField()}
                      value={withdraw[pair.address]}
                      max={new BigNumber(pair.userBalance)
                        .decimalPlaces(5)
                        .toString()}
                      disabled={isDisabled(status, shouldUpdateData)}
                      onValueChange={makeHandleDecimalFieldChange(pair.address)}
                    />
                    <Button
                      css={styles.pairDeleteBtn()}
                      size="small"
                      color="error"
                      disabled={
                        !new BigNumber(withdraw[pair.address]).gt('0') ||
                        isDisabled(status, shouldUpdateData)
                      }
                      onClick={makeHandleDeleteBtnClick(pair)}
                    >
                      Вывести
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
