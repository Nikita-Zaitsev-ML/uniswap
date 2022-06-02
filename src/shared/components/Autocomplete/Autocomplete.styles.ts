import { css } from '@mui/material';

const createStyles = () => ({
  root: () => css`
    & .MuiAutocomplete-endAdornment {
      height: 100%;
      display: flex;
      top: 0;
    }
  `,
});

export { createStyles };
