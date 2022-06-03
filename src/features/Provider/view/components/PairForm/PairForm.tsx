import { FC, ReactElement } from 'react';
import { useTheme } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  Card,
  Typography,
  Box,
  Button,
  WifiProtectedSetup,
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
  switchBtn?: { value: string; disabled?: boolean; onClick: () => void };
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

  if (values !== undefined) {
    const [theFirstItemValue, theSecondItemValue] = values;

    state.theFirstItemValue = theFirstItemValue;
    state.theSecondItemValue = theSecondItemValue;
  }

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
  };

  const makeHandleValueChange = (field: 'theFirst' | 'theSecond') => {
    const handleValueChange: Parameters<
      typeof FieldWithAutocomplete
    >['0']['onValueChange'] = ({ value }, { source }) => {
      if (source === 'event' && field === 'theFirst') {
        setValue('theFirstItemValue', value);
        onValueChange?.({ value, field });
      }

      if (source === 'event' && field === 'theSecond') {
        setValue('theSecondItemValue', value);
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
                <Button
                  variant="text"
                  size="small"
                  endIcon={<WifiProtectedSetup />}
                  disabled={switchBtn.disabled}
                  onClick={switchBtn.onClick}
                >
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
                value={new BigNumber(state.theFirstItemValue)
                  .decimalPlaces(5)
                  .toString()}
                balance={new BigNumber(theFirstItemBalance)
                  .decimalPlaces(5)
                  .toString()}
                max={new BigNumber(theFirstItemMax).decimalPlaces(5).toString()}
                isMaxBtnDisplayed={maxButtons[0]}
                inputProps={{
                  ...register('theFirstItemValue'),
                  onChange: undefined,
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
                value={new BigNumber(state.theSecondItemValue)
                  .decimalPlaces(5)
                  .toString()}
                balance={new BigNumber(theSecondItemBalance)
                  .decimalPlaces(5)
                  .toString()}
                max={new BigNumber(theSecondItemMax)
                  .decimalPlaces(5)
                  .toString()}
                isMaxBtnDisplayed={maxButtons[1]}
                inputProps={{
                  ...register('theSecondItemValue'),
                  onChange: undefined,
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
