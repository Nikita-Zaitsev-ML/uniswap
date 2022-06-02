import { BigNumber } from 'bignumber.js';

// uint256 max 78 digits 2**256-1
const maxUINT256Digits = 78;
const precision = 18;
const decimalPlaces = maxUINT256Digits + precision;

BigNumber.config({
  DECIMAL_PLACES: decimalPlaces,
  EXPONENTIAL_AT: 1e9,
  ROUNDING_MODE: BigNumber.ROUND_DOWN,
});

export { BigNumber };
