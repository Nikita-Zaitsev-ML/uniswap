import { FC, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { Add, Typography } from 'src/shared/components';
import { BigNumber, parseUnits } from 'src/shared/helpers/blockchain/numbers';

import { selectProvider, addLiquidity } from '../../../redux/slice';
import { getExistedPair, isDisabled } from '../../../utils';
import { PairForm } from '../../components/PairForm/PairForm';
import { ViewPairs } from '../ViewPairs/ViewPairs';
import { ViewType, SubmitButtonValue } from './types';
import { initialState } from './constants';
import { createStyles } from './Pools.style';

type Props = {
  userAddress: string | '';
  provider: ethers.providers.Web3Provider | null;
  signer: ethers.providers.JsonRpcSigner | null;
  disabled?: boolean;
};

const Pools: FC<Props> = ({ userAddress, provider, signer, disabled }) => {
  const isAuth = provider !== null && signer !== null;

  const styles = createStyles();

  const [viewType, setViewType] = useState<ViewType>('add');
  const [optionValues, setOptionValues] = useState<
    Parameters<typeof PairForm>['0']['itemValues']
  >(initialState.optionValues);
  const [tokenValues, setTokenValues] = useState<
    { value: string; userBalance: string }[]
  >([{ ...initialState.tokenValue }, { ...initialState.tokenValue }]);
  const [proportion, setProportion] = useState<{
    value: string | 'any' | '';
    decimals: number;
  }>(initialState.proportion);
  const [tokensMax, setTokensMax] = useState<string[]>(initialState.tokensMax);
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

  const { data, status, shouldUpdateData } = useAppSelector(selectProvider);
  const { tokens, pairs } = data;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (viewType === 'remove') {
      resetState();

      if (isAuth) {
        setSubmitValue('Выберите токены');
      } else {
        setSubmitValue('Подключите кошелек');
      }
    }
  }, [viewType, isAuth]);

  if (submitValue === 'Подключите кошелек' && isAuth) {
    setSubmitValue('Выберите токены');
  }

  const handleSwitchBtnClick = () => {
    if (viewType === 'add') {
      setViewType('remove');
    } else {
      setViewType('add');
    }
  };

  const handlePairFormPairSet: Parameters<
    typeof PairForm
  >['0']['onPairSet'] = ({ pair, isSet }) => {
    setOptionValues([...pair]);

    if (isAuth) {
      setSubmitValue(isSet ? 'Добавить ликвидность' : 'Выберите токены');
    } else {
      setSubmitValue(isSet ? 'Добавить ликвидность' : 'Подключите кошелек');
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

      const tokensMaxToSet = pair.map((item, index) => {
        if (item?.name === '') {
          return '0';
        }

        if (existedPair.proportion === 'any') {
          return index === 0 ? token0.userBalance : token1.userBalance;
        }

        if (index === 1) {
          const maxToken1 = new BigNumber(token0.userBalance)
            .div(existedPair.proportion)
            .toString();

          const token1MaxToSet = new BigNumber(maxToken1).gt(token1.userBalance)
            ? token1.userBalance
            : maxToken1;

          return token1MaxToSet;
        }

        const maxToken0 = new BigNumber(token1.userBalance)
          .times(existedPair.proportion)
          .toString();
        const token0MaxToSet = new BigNumber(maxToken0).gt(token0.userBalance)
          ? token0.userBalance
          : maxToken0;

        return token0MaxToSet;
      });

      const tokenValuesToSet = tokenValues.map((token, index) => {
        if (index === 1) {
          return {
            value: '',
            userBalance: tokenOutData?.userBalance,
          };
        }

        return {
          value: '',
          userBalance: tokenInData?.userBalance,
        };
      });

      const shouldReverse =
        token0.address === tokenOutData?.address &&
        token1.address === tokenInData?.address;

      setTokenValues(tokenValuesToSet);

      if (shouldReverse) {
        setProportion({
          value:
            existedPair.proportion === 'any'
              ? 'any'
              : new BigNumber('1').div(existedPair.proportion).toString(),
          decimals: existedPair.decimals,
        });

        setTokensMax(tokensMaxToSet.reverse());
      } else {
        setProportion({
          value: existedPair.proportion,
          decimals: existedPair.decimals,
        });
        setTokensMax(tokensMaxToSet);
      }
    } else {
      resetState();
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

      switch (field) {
        case 'theFirst': {
          const computedValue =
            proportion.value === 'any'
              ? tokenOut.value
              : new BigNumber(value).div(proportion.value).toString();

          setTokenValues([
            { ...tokenIn, value },
            { ...tokenOut, value: computedValue },
          ]);

          break;
        }
        case 'theSecond': {
          const computedValue =
            proportion.value === 'any'
              ? tokenIn.value
              : new BigNumber(value).times(proportion.value).toString();

          setTokenValues([
            { ...tokenIn, value: computedValue },
            { ...tokenOut, value },
          ]);

          break;
        }
        // no default
      }
    }
  };

  const onSubmit: Parameters<typeof PairForm>['0']['onSubmit'] = (
    submission
  ) => {
    const { theFirstItemKey, theSecondItemKey } = submission;

    const { tokenInData, tokenOutData } = getExistedPair({
      tokenInAddress: theFirstItemKey,
      tokenOutAddress: theSecondItemKey,
      tokens,
      pairs,
    });

    const tokenInAddress = tokenInData?.address;
    const tokenInValue = submission.theFirstItemValue;
    const tokenInDecimals = tokenInData?.decimals;
    const tokenOutAddress = tokenOutData?.address;
    const tokenOutValue = submission.theSecondItemValue;
    const tokenOutDecimals = tokenOutData?.decimals;

    const areOptionsValid =
      tokenInAddress !== undefined &&
      tokenInDecimals !== undefined &&
      tokenOutAddress !== undefined &&
      tokenOutDecimals !== undefined &&
      provider !== null &&
      signer !== null;

    if (areOptionsValid) {
      dispatch(
        addLiquidity({
          tokenInAddress,
          tokenInValue: parseUnits(tokenInValue, tokenInDecimals),
          tokenOutAddress,
          tokenOutValue: parseUnits(tokenOutValue, tokenOutDecimals),
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

  const [optionIn, optionOut] = optionValues;
  const [tokenIn, tokenOut] = tokenValues;
  const hasTokens = Boolean(optionIn?.name) && Boolean(optionOut?.name);
  const isInsufficientUserBalance =
    new BigNumber(tokenIn.userBalance).decimalPlaces(5).lt('0.00001') ||
    new BigNumber(tokenOut.userBalance).decimalPlaces(5).lt('0.00001');
  const isSubmitDisabled =
    submitValue !== 'Добавить ликвидность' ||
    isDisabled(status, shouldUpdateData);
  let hint;

  switch (proportion.value) {
    case 'any': {
      hint = 'пропорция любая';

      break;
    }
    case '': {
      hint = '';

      break;
    }
    default: {
      hint = `пропорция: ${new BigNumber(proportion.value)
        .decimalPlaces(5)
        .toString()}`;

      break;
    }
  }

  return viewType === 'add' ? (
    <PairForm
      title={
        proportion.value === 'any'
          ? 'Создать новую пару'
          : 'Добавить ликвидность'
      }
      hint={
        <>
          {hasTokens && isInsufficientUserBalance ? (
            <Typography css={styles.insufficientAmount()} color="error">
              Недостаточно средств
            </Typography>
          ) : null}
          <Typography css={styles.hint()} variant="caption">
            {hint}
          </Typography>
        </>
      }
      actionIcon={<Add />}
      switchBtn={{
        value: 'Мои пары',
        disabled: isDisabled(status, shouldUpdateData),
        onClick: handleSwitchBtnClick,
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
      maxButtons={[true, true]}
      isMaxSync={!(proportion.value === 'any' || proportion.value === '')}
      submitValue={submitValue}
      disabled={disabled}
      isSubmitDisabled={isSubmitDisabled}
      onPairSet={handlePairFormPairSet}
      onSubmit={onSubmit}
    />
  ) : (
    <ViewPairs
      userAddress={userAddress}
      provider={provider}
      signer={signer}
      switchBtn={{ onClick: handleSwitchBtnClick }}
    />
  );
};

export type { Props };

export { Pools };
