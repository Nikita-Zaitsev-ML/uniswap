import { FC } from 'react';
import NumberFormat, { NumberFormatValues } from 'react-number-format';

import { TextField } from 'src/shared/components';
import { BigNumber } from 'src/shared/helpers/blockchain/numbers';

type Props = Omit<
  Parameters<typeof TextField>['0'],
  'ref' | 'value' | 'defaultValue'
> & {
  max?: string;
  onValueChange?: ConstructorParameters<
    typeof NumberFormat
  >['0']['onValueChange'];
};

const MaskedDecimalField: FC<Props> = ({
  max = '0',
  onValueChange,
  ...textFieldProps
}) => {
  const withValueLimit = ({ value }: NumberFormatValues) => {
    if (value === '') {
      return true;
    }

    const decimals = value.split('.')[1]?.length || 0;
    const maxDecimals = max.split('.')[1]?.length || 0;

    const isAllowed =
      max !== undefined &&
      value !== '.' &&
      maxDecimals >= decimals &&
      new BigNumber(value).lte(max);

    return isAllowed;
  };

  return (
    <NumberFormat
      customInput={TextField}
      allowNegative={false}
      isAllowed={withValueLimit}
      onValueChange={onValueChange}
      {...textFieldProps}
      type="text"
      inputProps={{
        inputMode: 'decimal',
        placeholder: '0.0',
        ...textFieldProps.inputProps,
      }}
    />
  );
};

export type { Props };

export { MaskedDecimalField };
