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
  optionText: string;
  value?: string;
  max?: string;
  handleAutocompleteChange: (
    event: SyntheticEvent<Element, Event>,
    value: Item | null,
    reason: 'createOption' | 'selectOption' | 'removeOption' | 'blur' | 'clear'
  ) => void;
  handleMaxClick: () => void;
};

const FieldWithAutocomplete: FC<Props> = ({
  options,
  optionText,
  max = '0',
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
              isOptionEqualToValue={(option, value) =>
                option.name === value.name
              }
              getOptionLabel={(option) => option.name}
              renderOption={(props, option) => (
                <Box css={styles.option()} component="li" {...props}>
                  <Box css={styles.optionAvatar()}>
                    <Avatar
                      userName={option.name}
                      alt={`иконка ${optionText}`}
                    />
                  </Box>
                  <Box css={styles.optionText()} component="span">
                    {option.name}
                  </Box>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={`Выберите ${optionText}`}
                  size="small"
                  fullWidth
                />
              )}
              fullWidth
              disabled={disabled}
              onChange={handleAutocompleteChange}
            />
            <Box css={styles.balance()}>
              <Button
                css={styles.addBalanceBtn()}
                type="button"
                size="small"
                onClick={handleMaxClick}
              >
                макс
              </Button>
              <Typography
                css={styles.balanceValue()}
                title={max}
                variant="caption"
                noWrap
              >
                {max}
              </Typography>
            </Box>
          </InputAdornment>
        ),
      }}
    />
  );
};

export type { Props };

export { FieldWithAutocomplete };
