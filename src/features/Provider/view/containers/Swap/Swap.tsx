import { FC, useState } from 'react';
import { ethers } from 'ethers';
import { useTheme } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { ArrowDownward, Box, Typography } from 'src/shared/components';
import { createFilledArray } from 'src/shared/helpers/scripts/arrays';
import { BigNumber, parseUnits } from 'src/shared/helpers/blockchain/numbers';

import { selectProvider, setFeeValue, swapIn } from '../../../redux/slice';
import { Token } from '../../../types';
import {
  calculateSwapIn,
  calculateSwapOut,
  calculateMinOut,
  getExistedPair,
} from '../../../utils';
import { PairForm } from '../../components/PairForm/PairForm';
import { SubmitButtonValue } from './types';
import { initialState } from './constants';
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

  const [optionValues, setOptionValues] = useState<
    Parameters<typeof PairForm>['0']['itemValues']
  >(initialState.optionValues);
  const [tokenValues, setTokenValues] = useState<
    (Token & { value: string; pairBalance: string })[]
  >([{ ...initialState.tokenValue }, { ...initialState.tokenValue }]);
  const [proportion, setProportion] = useState<{
    value: string | 'any' | '';
    decimals: number;
  }>(initialState.proportion);
  const [tokensMax, setTokensMax] = useState<string[]>(initialState.tokensMax);
  const [slippage, setSlippage] = useState(initialState.slippage);
  const [submitValue, setSubmitValue] =
    useState<SubmitButtonValue>('Подключите кошелек');

  const resetState = ({ withOptionValues = false } = {}) => {
    if (withOptionValues) {
      setOptionValues(initialState.optionValues);
    }

    setTokenValues([
      { ...initialState.tokenValue },
      { ...initialState.tokenValue },
    ]);
    setTokensMax(initialState.tokensMax);
    setProportion(initialState.proportion);
  };

  const { data } = useAppSelector(selectProvider);
  const { tokens, pairs, fee } = data;
  const dispatch = useAppDispatch();

  if (submitValue === 'Подключите кошелек' && isAuth) {
    setSubmitValue('Выберите токены');
  }

  const handlePairFormPairSet: Parameters<
    typeof PairForm
  >['0']['onPairSet'] = ({ pair, isSet }) => {
    setOptionValues([...pair]);

    if (isAuth) {
      setSubmitValue(isSet ? 'Укажите количество' : 'Выберите токены');
    } else {
      setSubmitValue(isSet ? 'Укажите количество' : 'Подключите кошелек');
    }

    const [tokenIn, tokenOut] = pair;
    const { existedPair, tokenInData, tokenOutData } = getExistedPair({
      tokenInAddress: tokenIn?.key || '',
      tokenOutAddress: tokenOut?.key || '',
      tokens,
      pairs,
    });

    const arePairTokensDefined =
      existedPair !== undefined &&
      tokenInData !== undefined &&
      tokenOutData !== undefined;

    if (arePairTokensDefined) {
      const {
        tokens: [token0, token1],
      } = existedPair;

      const shouldReverse =
        token0.address === tokenOutData?.address &&
        token1.address === tokenInData?.address;

      const [tokenInPairBalance, tokenOutPairBalance] = shouldReverse
        ? [token0.pairBalance, token1.pairBalance].reverse()
        : [token0.pairBalance, token1.pairBalance];

      const maxTokenIn = BigNumber.min(
        tokenInData.userBalance,
        tokenInPairBalance
      ).toString();

      const tokensMaxToSet = pair.map((item, index) => {
        if (item?.name === '' || existedPair.proportion === 'any') {
          return '0';
        }

        if (index === 1) {
          const tokenOutMaxToSet = calculateSwapIn({
            amountIn: parseUnits(maxTokenIn, tokenInData.decimals),
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

        const tokenInMaxToSet = maxTokenIn;

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
          value: existedPair.proportion,
        });
      } else {
        setProportion({
          decimals: existedPair.decimals,
          value:
            existedPair.proportion === 'any'
              ? 'any'
              : new BigNumber('1').div(existedPair.proportion).toString(),
        });
      }
    } else {
      resetState();
      dispatch(setFeeValue('0'));
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
        setSubmitValue('Укажите количество');

        return;
      }

      const [tokenIn, tokenOut] = tokenValues;
      let calculatedValue;

      if (tokenIn.value !== undefined && tokenOut.value !== undefined) {
        setSubmitValue('Обменять');
      }

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

      dispatch(setFeeValue(calculateValueFeeAmount));
    }
  };

  const handleSlippageChange: Required<
    Parameters<typeof PairForm>['0']
  >['slider']['onChangeCommitted'] = (event, value) => {
    if (typeof value === 'number') {
      setSlippage(value);
    }
  };

  const onSubmit: Parameters<typeof PairForm>['0']['onSubmit'] = (
    submission
  ) => {
    const areOptionsValid = provider !== null && signer !== null;

    if (areOptionsValid) {
      const [tokenIn, tokenOut] = tokenValues;
      const tokenInValue = submission.theFirstItemValue;
      const tokenOutValue = submission.theSecondItemValue;

      dispatch(
        swapIn({
          tokenInAddress: tokenIn.address,
          tokenInValue: parseUnits(tokenInValue, tokenIn.decimals),
          tokenOutAddress: tokenOut.address,
          tokenOutMin: parseUnits(
            calculateMinOut({
              amountOut: tokenOutValue,
              slippage,
              decimals: tokenOut.decimals,
            }),
            tokenOut.decimals
          ),
          provider,
          signer,
        })
      ).then(() => {
        setSubmitValue('Выберите токены');
      });

      resetState({ withOptionValues: true });
      setSubmitValue('Идет транзакция...');
    }
  };

  const [tokenIn, tokenOut] = tokenValues;
  let proportionHint;
  let commissionHint;
  let slippageHint;

  const isInvalidValue =
    new BigNumber(tokenIn.value).eq(0) ||
    new BigNumber(tokenOut.value).eq(0) ||
    tokenIn.value === '' ||
    tokenOut.value === '';
  const isInsufficientLiquidity = proportion.value === 'any';
  const isInsufficientUserBalance =
    new BigNumber(tokenIn.userBalance).decimalPlaces(5).lt('0.00001') ||
    new BigNumber(tokenOut.userBalance).decimalPlaces(5).lt('0.00001');
  const canSwap = !(isInvalidValue || isInsufficientLiquidity);
  const isSubmitDisabled = !canSwap || submitValue !== 'Обменять';
  const hasTokens = tokenIn.name !== '' && tokenOut.name !== '';
  const hasValues = tokenIn.value !== '' && tokenOut.value !== '';
  const shouldDisplayHints = hasTokens && hasValues;

  if (shouldDisplayHints) {
    const swapOutValue = new BigNumber('1')
      .times(proportion.value)
      .toFixed(tokenIn.decimals);

    proportionHint = `1 ${tokenIn.name} = ${new BigNumber(swapOutValue)
      .decimalPlaces(5)
      .toString()} ${tokenOut.name}`;
    commissionHint = `комиссия: ${new BigNumber(tokenOut.value)
      .minus(new BigNumber(tokenIn.value).times(proportion.value))
      .abs()
      .decimalPlaces(5)
      .toString()} ${tokenOut.name}`;
    slippageHint = `минимально получите: ${new BigNumber(
      calculateMinOut({
        amountOut: tokenOut.value,
        slippage,
        decimals: tokenOut.decimals,
      })
    )
      .decimalPlaces(5)
      .toString()} ${tokenOut.name}`;
  }

  return (
    <PairForm
      title={'Обменять'}
      hint={
        <>
          {isInsufficientLiquidity ? (
            <Typography css={styles.insufficientAmount()} color="error">
              Недостаточно ликвидности
            </Typography>
          ) : null}
          {hasTokens && isInsufficientUserBalance ? (
            <Typography css={styles.insufficientAmount()} color="error">
              Недостаточно средств
            </Typography>
          ) : null}
          {shouldDisplayHints ? (
            <Box css={styles.hint()}>
              {proportionHint && (
                <Typography css={styles.proportion()} variant="caption">
                  {proportionHint}
                </Typography>
              )}
              {commissionHint && (
                <Typography css={styles.commission()} variant="caption">
                  {commissionHint}
                </Typography>
              )}
              {slippageHint && (
                <Typography css={styles.slippage()} variant="caption">
                  {slippageHint}
                </Typography>
              )}
            </Box>
          ) : null}
        </>
      }
      actionIcon={<ArrowDownward />}
      slider={{
        defaultValue: initialState.slippage,
        min: 5,
        max: 50,
        marks: createFilledArray(50 / 5, (undefinedValue, index) => {
          const minMark = 5;
          const step = 50 / 10;
          const value = minMark + index * step;

          const mark = { value, label: `${value}%` };

          return mark;
        }),
        valueLabelDisplay: 'auto',
        onChangeCommitted: handleSlippageChange,
      }}
      items={tokens.map(({ address, name, symbol, image }) => ({
        key: address,
        name,
        symbol,
        image,
      }))}
      itemValues={optionValues}
      values={tokenValues.map(({ value }) => value)}
      onValueChange={onValueChange}
      balance={[tokenIn.userBalance, tokenOut.userBalance]}
      max={tokensMax}
      maxButtons={[true, false]}
      isMaxSync
      submitValue={submitValue}
      disabled={disabled}
      isSubmitDisabled={isSubmitDisabled}
      onPairSet={handlePairFormPairSet}
      onSubmit={onSubmit}
    />
  );
};

export type { Props };

export { Swap };
