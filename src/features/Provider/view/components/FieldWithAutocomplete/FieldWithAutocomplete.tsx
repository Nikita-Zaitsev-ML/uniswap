import { FC, SyntheticEvent } from 'react';
import { useTheme } from '@mui/material';

import {
  InputAdornment,
  Autocomplete,
  Box,
  Avatar,
  TextField,
  Button,
  Typography,
} from 'src/shared/components';

import type { Item } from '../types';
import {
  MaskedDecimalField,
  Props as MaskedDecimalFieldProps,
} from '../MaskedDecimalField/MaskedDecimalField';
import { createStyles } from './FieldWithAutocomplete.style';

type Props = MaskedDecimalFieldProps & {
  options: Item[];
  optionValue: Item | null;
  shouldResetOption?: boolean;
  optionText: string;
  value?: string;
  max?: string;
  balance?: string;
  isMaxBtnDisplayed?: boolean;
  handleAutocompleteChange: (
    event: SyntheticEvent<Element, Event>,
    value: Item | null,
    reason: 'createOption' | 'selectOption' | 'removeOption' | 'blur' | 'clear'
  ) => void;
  handleMaxClick: () => void;
};

const FieldWithAutocomplete: FC<Props> = ({
  options,
  optionValue,
  optionText,
  max = '0',
  balance = '0',
  isMaxBtnDisplayed = false,
  disabled = false,
  handleAutocompleteChange,
  handleMaxClick,
  ...maskedDecimalFieldProps
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <MaskedDecimalField
      css={styles.root()}
      max={max}
      disabled={disabled}
      {...maskedDecimalFieldProps}
      InputProps={{
        disableUnderline: true,
        endAdornment: (
          <InputAdornment
            css={styles.adornment()}
            position="end"
            orientation="vertical"
          >
            <Autocomplete
              css={styles.autocomplete()}
              options={options}
              value={optionValue}
              isOptionEqualToValue={(option, value) =>
                option.name === value?.name
              }
              getOptionLabel={({ symbol }) => symbol}
              renderOption={(props, option) => (
                <Box css={styles.option()} component="li" {...props}>
                  <Box css={styles.optionAvatar()}>
                    <Avatar
                      src={option.image}
                      alt={`иконка ${optionText}`}
                      hasImage
                    />
                  </Box>
                  <Typography
                    css={styles.optionText()}
                    title={option.name}
                    noWrap
                  >
                    {option.symbol}
                  </Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`${optionText}`}
                  size="small"
                  fullWidth
                />
              )}
              fullWidth
              disabled={disabled}
              onChange={handleAutocompleteChange}
            />
            <Box css={styles.caption()}>
              <Typography
                css={styles.captionBalance()}
                variant="caption"
                title={balance}
                noWrap
              >
                Баланс: {balance}
              </Typography>
              <Typography
                css={styles.captionMax()}
                variant="caption"
                title={max}
                noWrap
              >
                Макс: {max}
              </Typography>
              {isMaxBtnDisplayed && (
                <Button
                  css={styles.addMaxBtn()}
                  type="button"
                  size="small"
                  color="secondary"
                  disabled={disabled}
                  fullWidth
                  onClick={handleMaxClick}
                >
                  макс
                </Button>
              )}
            </Box>
          </InputAdornment>
        ),
      }}
    />
  );
};

export type { Props };

export { FieldWithAutocomplete };
