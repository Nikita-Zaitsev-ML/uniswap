import { FC, useState } from 'react';
import { ethers } from 'ethers';
import { useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { ArrowDownward, Box, Typography } from 'src/shared/components';
import { BigNumber, parseUnits } from 'src/shared/helpers/blockchain/numbers';

import { selectProvider, setFeeAmount, swapIn } from '../../../redux/slice';
import { Token } from '../../../types';
import { calculateSwapIn, calculateSwapOut } from '../../../utils';
import { PairForm } from '../../components/PairForm/PairForm';
import { SubmitButtonValue } from './types';
import { createStyles } from './Swap.style';

type Props = {
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  disabled?: boolean;
};

const Swap: FC<Props> = ({ provider, signer, disabled }) => {
  const isAuth = provider !== null && signer !== null;

  const theme = useTheme();
  const styles = createStyles(theme);

  const tokenStateDefault = {
    address: '',
    name: '',
    value: '',
    userBalance: '',
    pairBalance: '',
    decimals: 0,
  };

  const [tokenValues, setTokenValues] = useState<
    (Token & { value: string; pairBalance: string })[]
  >([{ ...tokenStateDefault }, { ...tokenStateDefault }]);
  const [proportion, setProportion] = useState<{
    value: string | 'any' | '';
    decimals: number;
  }>({ value: '', decimals: 0 });
  const [tokensMax, setTokensMax] = useState<string[]>(['0', '0']);
  // TODO: add slippage view
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [slippage, setSlippage] = useState(10);
  const [submitValue, setSubmitValue] =
    useState<SubmitButtonValue>('Подключите кошелек');

  const { data } = useAppSelector(selectProvider);
  const { tokens, pairs, fee } = data;
  const dispatch = useAppDispatch();

  if (submitValue === 'Подключите кошелек' && isAuth) {
    setSubmitValue('Выберите токены');
  }

  const canSwap = !(proportion.value === '' || proportion.value === 'any');
  const isSubmitDisabled =
    !canSwap ||
    submitValue === 'Подключите кошелек' ||
    submitValue === 'Выберите токены';

  const handlePairFormPairSet: Parameters<
    typeof PairForm
  >['0']['onPairSet'] = ({ pair, isSet }) => {
    if (isAuth) {
      setSubmitValue(isSet ? 'Обменять' : 'Выберите токены');
    } else {
      setSubmitValue(isSet ? 'Обменять' : 'Подключите кошелек');
    }

    const [tokenIn, tokenOut] = pair;
    // FIXME: вынести в утилиты
    const tokenInData = tokens.find((token) => token.name === tokenIn.name);
    const tokenOutData = tokens.find((token) => token.name === tokenOut.name);
    const existedPair = pairs.find(
      ({ tokens: [token0, token1] }) =>
        (token0.address === tokenInData?.address &&
          token1.address === tokenOutData?.address) ||
        (token1.address === tokenInData?.address &&
          token0.address === tokenOutData?.address)
    );

    if (
      existedPair !== undefined &&
      tokenInData !== undefined &&
      tokenOutData !== undefined
    ) {
      const {
        tokens: [token0, token1],
      } = existedPair;

      const shouldReverse =
        token0.address === tokenOutData?.address &&
        token1.address === tokenInData?.address;

      const [tokenInPairBalance, tokenOutPairBalance] = shouldReverse
        ? [token0.pairBalance, token1.pairBalance].reverse()
        : [token0.pairBalance, token1.pairBalance];

      const minTokenIn = BigNumber.min(
        tokenInData.userBalance,
        tokenInPairBalance
      ).toString();

      const tokensMaxToSet = pair.map(({ name }, index) => {
        if (name === '' || existedPair.proportion === 'any') {
          return '0';
        }

        if (index === 1) {
          const tokenOutMaxToSet = calculateSwapIn({
            amountIn: parseUnits(minTokenIn, tokenInData.decimals),
            balanceIn: parseUnits(tokenInPairBalance, tokenInData.decimals),
            balanceOut: parseUnits(tokenOutPairBalance, tokenOutData.decimals),
            fee: {
              amount: parseUnits(fee.value, fee.decimals),
              decimals: fee.decimals,
            },
            decimals: Math.max(tokenInData.decimals, tokenOutData.decimals),
          });

          return tokenOutMaxToSet;
        }

        const tokenInMaxToSet = minTokenIn;

        return tokenInMaxToSet;
      });

      const tokenValuesToSet = tokenValues.map((token, index) => {
        if (index === 1) {
          return {
            ...tokenOutData,
            value: '',
            pairBalance: tokenOutPairBalance,
          };
        }

        return {
          ...tokenInData,
          value: '',
          pairBalance: tokenInPairBalance,
        };
      });

      setTokenValues(tokenValuesToSet);
      setTokensMax(tokensMaxToSet);

      if (shouldReverse) {
        setProportion({
          decimals: existedPair.decimals,
          value: new BigNumber('1').div(existedPair.proportion).toString(),
        });
      } else {
        setProportion({
          decimals: existedPair.decimals,
          value: existedPair.proportion,
        });
      }
    } else {
      setProportion({
        value: '',
        decimals: 0,
      });
      setTokenValues(
        tokenValues.map((token) => {
          return {
            ...tokenStateDefault,
            value: token.value,
          };
        })
      );
      setTokensMax(['0', '0']);
      dispatch(setFeeAmount('0'));
    }
  };

  const onValueChange: Parameters<typeof PairForm>['0']['onValueChange'] = (
    event
  ) => {
    if (event !== undefined && proportion.value !== '') {
      const { field, value } = event;

      if (value === undefined || value === '') {
        setTokenValues(
          tokenValues.map((token) => {
            return { ...token, value: '' };
          })
        );

        return;
      }

      const [tokenIn, tokenOut] = tokenValues;
      let calculatedValue;

      switch (field) {
        case 'theFirst': {
          calculatedValue = calculateSwapIn({
            amountIn: parseUnits(value, tokenIn.decimals),
            balanceIn: parseUnits(tokenIn.pairBalance, tokenIn.decimals),
            balanceOut: parseUnits(tokenOut.pairBalance, tokenOut.decimals),
            fee: {
              amount: parseUnits(fee.value, fee.decimals),
              decimals: fee.decimals,
            },
            decimals: Math.max(tokenIn.decimals, tokenOut.decimals),
          });

          setTokenValues([
            { ...tokenIn, value: value || '' },
            { ...tokenOut, value: calculatedValue },
          ]);

          break;
        }
        case 'theSecond': {
          calculatedValue = calculateSwapOut({
            amountOut: parseUnits(value, tokenOut.decimals),
            balanceIn: parseUnits(tokenIn.pairBalance, tokenIn.decimals),
            balanceOut: parseUnits(tokenOut.pairBalance, tokenOut.decimals),
            fee: {
              amount: parseUnits(fee.value, fee.decimals),
              decimals: fee.decimals,
            },
            decimals: Math.max(tokenIn.decimals, tokenOut.decimals),
          });

          setTokenValues([
            { ...tokenIn, value: calculatedValue },
            { ...tokenOut, value: value || '' },
          ]);

          break;
        }
        // no default
      }

      const calculateValueFeeAmount = new BigNumber(calculatedValue)
        .times(fee.value)
        .toString();

      dispatch(setFeeAmount(calculateValueFeeAmount));
    }
  };

  const onSubmit: Parameters<typeof PairForm>['0']['onSubmit'] = async (
    submission
  ) => {
    const areOptionsValid = provider !== null && signer !== null;

    if (areOptionsValid) {
      const [tokenIn, tokenOut] = tokenValues;
      const tokenInValue = submission.theFirstItemValue;
      const tokenOutValue = submission.theSecondItemValue;

      // TODO: добавить slippage и вынести это так чтобы давать подсказку сколько минимально получит пользователь
      const tokenOutValueBigNumber = new BigNumber(
        parseUnits(tokenOutValue, tokenOut.decimals).toString()
      );
      const tokenOutMin = tokenOutValueBigNumber
        .minus(tokenOutValueBigNumber.times(slippage).div(100))
        .toFixed(0);

      await dispatch(
        swapIn({
          tokenInAddress: tokenIn.address,
          tokenInValue: parseUnits(tokenInValue, tokenIn.decimals),
          tokenOutAddress: tokenOut.address,
          tokenOutMin: ethers.BigNumber.from(tokenOutMin),
          provider,
          signer,
        })
      );
    }
  };

  const [tokenIn, tokenOut] = tokenValues;
  let swapOut;
  let swapHint;

  if (tokenIn.name !== '' && tokenOut.name !== '') {
    swapOut = calculateSwapIn({
      amountIn: parseUnits('1', tokenIn.decimals),
      balanceIn: parseUnits(tokenIn.pairBalance, tokenIn.decimals),
      balanceOut: parseUnits(tokenOut.pairBalance, tokenOut.decimals),
      fee: {
        amount: parseUnits(fee.value, fee.decimals),
        decimals: fee.decimals,
      },
      decimals: Math.max(tokenIn.decimals, tokenOut.decimals),
    });
    swapHint = `1 ${tokenIn.name} = ${swapOut} ${tokenOut.name}`;
  }

  return (
    <PairForm
      title={'Обменять'}
      hint={
        <Box css={styles.hint()}>
          <Typography css={styles.proportion()} variant="caption">
            {swapHint}
          </Typography>
        </Box>
      }
      actionIcon={<ArrowDownward />}
      items={tokens}
      itemText={'токен'}
      values={tokenValues.map(({ value }) => value)}
      onValueChange={onValueChange}
      max={tokensMax}
      isMaxSync
      submitValue={submitValue}
      disabled={disabled}
      isSubmitDisabled={isSubmitDisabled || disabled}
      onPairSet={handlePairFormPairSet}
      onSubmit={onSubmit}
    />
  );
};

export type { Props };

export { Swap };
