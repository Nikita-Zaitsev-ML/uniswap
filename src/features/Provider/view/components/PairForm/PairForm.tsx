import { FC, ReactElement, useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Card,
  Typography,
  Box,
  Button,
  ArrowDownward,
  Slider,
} from 'src/shared/components';
import { BigNumber } from 'src/shared/helpers/blockchain/numbers';

import {
  FieldWithAutocomplete,
  Props as FieldWithAutocompleteProps,
} from '../FieldWithAutocomplete/FieldWithAutocomplete';
import { Item } from '../types';
import { schema } from './schema/schema';
import { FormState } from './types';
import { createStyles } from './PairForm.style';

type Props = {
  title: string;
  items: Item[];
  itemValues: (Item | null)[];
  itemText?: string;
  hint?: ReactElement;
  actionIcon?: ReactElement;
  values?: string[];
  balance?: string[];
  max?: string[];
  maxButtons?: boolean[];
  isMaxSync?: boolean;
  submitValue: string;
  disabled?: boolean;
  isSubmitDisabled?: boolean;
  onPairSet?: (data: { pair: (Item | null)[]; isSet: boolean }) => void;
  onValueChange?: (
    event:
      | {
          value: string | undefined;
          field: 'theFirst' | 'theSecond';
        }
      | undefined
  ) => void;
  onSubmit: (data: FormState) => void;
  switchBtn?: { value: string; onClick: () => void };
  slider?: Parameters<typeof Slider>['0'];
};

const PairForm: FC<Props> = ({
  title,
  items,
  itemValues,
  itemText = 'Токен',
  hint = undefined,
  actionIcon = <ArrowDownward />,
  values = undefined,
  balance = ['0', '0'],
  max = ['0', '0'],
  maxButtons = [false, false],
  isMaxSync = false,
  submitValue = 'Отправить',
  disabled = false,
  isSubmitDisabled = disabled,
  onPairSet,
  onValueChange,
  onSubmit,
  switchBtn = undefined,
  slider = undefined,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const {
    watch,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormState>({
    defaultValues: {
      theFirstItemKey: '',
      theFirstItem: '',
      theFirstItemValue: '',
      theSecondItemKey: '',
      theSecondItem: '',
      theSecondItemValue: '',
    },
    resolver: yupResolver(schema),
  });
  const state = watch();

  // FIXME: this is a crutch to combine the controlled and uncontrolled behavior of NumberFormat - I did not understand how to use NumberFormat validation together with the react-hook-form state
  const [shouldRerender, setShouldRerender] = useState<undefined | true>();

  useEffect(() => {
    if (values !== undefined) {
      setValue('theFirstItemValue', values[0]);
      setValue('theSecondItemValue', values[1]);
      setShouldRerender(true);
    }
  }, [setValue, values]);

  useEffect(() => {
    setShouldRerender(undefined);
  }, [shouldRerender]);

  const [theFirstItemMax, theSecondItemMax] = max;
  const [theFirstItemBalance, theSecondItemBalance] = balance;

  const handleTheFirstItemAutocompleteChange: FieldWithAutocompleteProps['handleAutocompleteChange'] =
    (event, value) => {
      if (value === null) {
        setValue('theFirstItemKey', '');
        setValue('theFirstItem', '');

        onPairSet?.({
          pair: [
            value,
            itemValues[1] === null
              ? null
              : {
                  ...itemValues[1],
                },
          ],
          isSet: false,
        });

        return;
      }

      setValue('theFirstItemKey', value.key);
      setValue('theFirstItem', value.name);
      setValue('theFirstItemValue', '');
      setValue('theSecondItemValue', '');

      onPairSet?.({
        pair: [
          { ...value },
          itemValues[1] === null
            ? null
            : {
                ...itemValues[1],
              },
        ],
        isSet: value.name !== '' && state.theSecondItem !== '',
      });
      setShouldRerender(true);
    };

  const handleTheFirstItemMaxClick = () => {
    setValue('theFirstItemValue', theFirstItemMax);

    if (isMaxSync) {
      setValue('theSecondItemValue', theSecondItemMax);
    }

    onValueChange?.({
      value: theFirstItemMax,
      field: 'theFirst',
    });

    setShouldRerender(true);
  };

  const handleTheSecondItemAutocompleteChange: FieldWithAutocompleteProps['handleAutocompleteChange'] =
    (event, value) => {
      if (value === null) {
        setValue('theSecondItemKey', '');
        setValue('theSecondItem', '');

        onPairSet?.({
          pair: [
            itemValues[0] === null
              ? null
              : {
                  ...itemValues[0],
                },
            value,
          ],
          isSet: false,
        });

        return;
      }

      setValue('theSecondItemKey', value.key);
      setValue('theSecondItem', value.name);
      setValue('theFirstItemValue', '');
      setValue('theSecondItemValue', '');

      onPairSet?.({
        pair: [
          itemValues[0] === null
            ? null
            : {
                ...itemValues[0],
              },
          { ...value },
        ],
        isSet: value.name !== '' && state.theFirstItem !== '',
      });
      setShouldRerender(true);
    };

  const handleTheSecondItemMaxClick = () => {
    setValue('theSecondItemValue', theSecondItemMax);

    if (isMaxSync) {
      setValue('theFirstItemValue', theFirstItemMax);
    }

    onValueChange?.({
      value: theFirstItemMax,
      field: 'theFirst',
    });

    setShouldRerender(true);
  };

  const makeHandleValueChange = (field: 'theFirst' | 'theSecond') => {
    const handleValueChange: Parameters<
      typeof FieldWithAutocomplete
    >['0']['onValueChange'] = ({ value }, { source }) => {
      if (source === 'event') {
        onValueChange?.({ value, field });
      }
    };

    return handleValueChange;
  };

  const handleRootSubmit: (data: FormState) => void = (data) => {
    setValue('theFirstItemKey', '');
    setValue('theFirstItem', '');
    setValue('theSecondItemKey', '');
    setValue('theSecondItem', '');

    onSubmit(data);
  };

  return (
    <Card
      css={styles.root()}
      content={{
        children: (
          <form onSubmit={handleSubmit(handleRootSubmit)}>
            <Box css={styles.header()}>
              <Typography css={styles.title()} component="h3" variant="body1">
                {title}
              </Typography>
              {switchBtn !== undefined && (
                <Button variant="text" size="small" onClick={switchBtn.onClick}>
                  {switchBtn.value}
                </Button>
              )}
            </Box>
            <Box css={styles.panel()}>
              <FieldWithAutocomplete
                options={items.filter(
                  (item) => item.name !== state.theSecondItem
                )}
                optionValue={itemValues[0]}
                optionText={itemText}
                value={
                  shouldRerender &&
                  new BigNumber(state.theFirstItemValue)
                    .decimalPlaces(5)
                    .toString()
                }
                balance={new BigNumber(theFirstItemBalance)
                  .decimalPlaces(5)
                  .toString()}
                max={new BigNumber(theFirstItemMax).decimalPlaces(5).toString()}
                isMaxBtnDisplayed={maxButtons[0]}
                inputProps={{
                  ...register('theFirstItemValue'),
                }}
                error={
                  Boolean(errors?.theFirstItem) ||
                  Boolean(errors?.theFirstItemValue)
                }
                helperText={
                  errors?.theFirstItem?.message ||
                  errors?.theFirstItemValue?.message
                }
                variant="filled"
                fullWidth
                disabled={disabled}
                handleAutocompleteChange={handleTheFirstItemAutocompleteChange}
                onValueChange={makeHandleValueChange('theFirst')}
                handleMaxClick={handleTheFirstItemMaxClick}
              />
              <Box css={styles.arrow()}>{actionIcon}</Box>
              <FieldWithAutocomplete
                options={items.filter(
                  (item) => item.name !== state.theFirstItem
                )}
                optionValue={itemValues[1]}
                optionText={itemText}
                value={
                  shouldRerender &&
                  new BigNumber(state.theSecondItemValue)
                    .decimalPlaces(5)
                    .toString()
                }
                balance={new BigNumber(theSecondItemBalance)
                  .decimalPlaces(5)
                  .toString()}
                max={new BigNumber(theSecondItemMax)
                  .decimalPlaces(5)
                  .toString()}
                isMaxBtnDisplayed={maxButtons[1]}
                inputProps={{
                  ...register('theSecondItemValue'),
                }}
                error={
                  Boolean(errors?.theSecondItem) ||
                  Boolean(errors?.theSecondItemValue)
                }
                helperText={
                  errors?.theSecondItem?.message ||
                  errors?.theSecondItemValue?.message
                }
                variant="filled"
                fullWidth
                disabled={disabled}
                handleAutocompleteChange={handleTheSecondItemAutocompleteChange}
                onValueChange={makeHandleValueChange('theSecond')}
                handleMaxClick={handleTheSecondItemMaxClick}
              />
              {hint}
              {slider !== undefined && (
                <Box css={styles.slippage()}>
                  <Typography css={styles.slippageTitle()}>
                    Допустимое проскальзывание ?
                  </Typography>
                  <Box css={styles.slippageSlider()}>
                    <Slider {...slider} />
                  </Box>
                </Box>
              )}
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled={isSubmitDisabled || disabled}
                rounded
                fullWidth
              >
                {submitValue}
              </Button>
            </Box>
          </form>
        ),
      }}
    />
  );
};

export type { Props };

export { PairForm };
