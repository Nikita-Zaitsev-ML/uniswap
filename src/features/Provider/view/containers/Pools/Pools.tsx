import { FC, useEffect, useState } from 'react';
import { ethers } from 'ethers';

import { useAppDispatch, useAppSelector } from 'src/app/hooks';
import { Add, Typography } from 'src/shared/components';
import { BigNumber, parseUnits } from 'src/shared/helpers/blockchain/numbers';

import { selectProvider, addLiquidity } from '../../../redux/slice';
import { getExistedPair } from '../../../utils';
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
  const [tokenValues, setTokenValues] = useState<string[]>(
    initialState.tokenValues
  );
  const [proportion, setProportion] = useState<{
    value: string | 'any' | '';
    decimals: number;
  }>(initialState.proportion);
  const [tokensMax, setTokensMax] = useState<string[]>(initialState.tokensMax);
  const [submitValue, setSubmitValue] =
    useState<SubmitButtonValue>('Подключите кошелек');
  const [isDisabled, setIsDisabled] = useState(false);

  const { data } = useAppSelector(selectProvider);
  const { tokens, pairs } = data;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (viewType === 'remove') {
      setTokensMax(initialState.tokensMax);
      setProportion(initialState.proportion);

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

  const isSubmitDisabled =
    submitValue === 'Подключите кошелек' ||
    submitValue === 'Выберите токены' ||
    isDisabled;

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
    if (isAuth) {
      setSubmitValue(isSet ? 'Добавить пару' : 'Выберите токены');
    } else {
      setSubmitValue(isSet ? 'Добавить пару' : 'Подключите кошелек');
    }

    const [tokenIn, tokenOut] = pair;
    const { existedPair, tokenInData, tokenOutData } = getExistedPair({
      tokenInName: tokenIn.name,
      tokenOutName: tokenOut.name,
      tokens,
      pairs,
    });

    if (existedPair !== undefined) {
      const {
        tokens: [token0, token1],
      } = existedPair;

      const tokensMaxToSet = pair.map(({ name }, index) => {
        if (name === '') {
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

      const shouldReverse =
        token0.address === tokenOutData?.address &&
        token1.address === tokenInData?.address;

      if (shouldReverse) {
        setProportion({
          value:
            existedPair.proportion === 'any'
              ? 'any'
              : new BigNumber('1').div(existedPair.proportion).toString(),
          decimals: existedPair.decimals,
        });

        setTokenValues(tokenValues.reverse());
        setTokensMax(tokensMaxToSet.reverse());
      } else {
        setProportion({
          value: existedPair.proportion,
          decimals: existedPair.decimals,
        });
        setTokensMax(tokensMaxToSet);
      }
    } else {
      setProportion(initialState.proportion);
      setTokenValues(initialState.tokenValues);
      setTokensMax(initialState.tokensMax);
    }
  };

  const onValueChange: Parameters<typeof PairForm>['0']['onValueChange'] = (
    event
  ) => {
    if (event !== undefined && proportion.value !== '') {
      const { field, value } = event;

      if (value === undefined || value === '') {
        setTokenValues(initialState.tokenValues);

        return;
      }

      switch (field) {
        case 'theFirst': {
          const computedValue =
            proportion.value === 'any'
              ? tokenValues[1]
              : new BigNumber(value).div(proportion.value).toString();

          setTokenValues([value, computedValue]);

          break;
        }
        case 'theSecond': {
          const computedValue =
            proportion.value === 'any'
              ? tokenValues[0]
              : new BigNumber(value).times(proportion.value).toString();

          setTokenValues([computedValue, value]);

          break;
        }
        // no default
      }
    }
  };

  const onSubmit: Parameters<typeof PairForm>['0']['onSubmit'] = (
    submission
  ) => {
    const { theFirstItem, theSecondItem } = submission;
    const tokenIn = tokens.find((token) => token.name === theFirstItem);
    const tokenOut = tokens.find((token) => token.name === theSecondItem);
    const tokenInAddress = tokenIn?.address;
    const tokenInValue = submission.theFirstItemValue;
    const tokenInDecimals = tokenIn?.decimals;
    const tokenOutAddress = tokenOut?.address;
    const tokenOutValue = submission.theSecondItemValue;
    const tokenOutDecimals = tokenOut?.decimals;

    const areOptionsValid =
      tokenInAddress !== undefined &&
      tokenInDecimals !== undefined &&
      tokenOutAddress !== undefined &&
      tokenOutDecimals !== undefined &&
      provider !== null &&
      signer !== null;

    if (areOptionsValid) {
      setIsDisabled(true);
      setSubmitValue('Идет транзакция');

      dispatch(
        addLiquidity({
          tokenInAddress,
          tokenInValue: parseUnits(tokenInValue, tokenInDecimals),
          tokenOutAddress,
          tokenOutValue: parseUnits(tokenOutValue, tokenOutDecimals),
          provider,
          signer,
        })
      );
    }
  };

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
      hint = `пропорция: ${new BigNumber(proportion.value).toFixed(
        proportion.decimals
      )}`;

      break;
    }
  }

  return viewType === 'add' ? (
    <PairForm
      title={
        proportion.value === 'any'
          ? 'Добавить ликвидность с заданием пропорции'
          : 'Добавить ликвидность'
      }
      hint={<Typography css={styles.hint()}>{hint}</Typography>}
      actionIcon={<Add />}
      switchBtn={{
        value: 'Мои пары',
        onClick: handleSwitchBtnClick,
      }}
      items={tokens}
      itemText={'токен'}
      values={tokenValues}
      onValueChange={onValueChange}
      max={tokensMax}
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
