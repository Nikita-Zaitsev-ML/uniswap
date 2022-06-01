import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

const createStyles = (theme: Theme) => ({
  root: () => css``,
  logo: () => css``,
  auth: () => css``,
  user: () =>
    css`
      max-width: ${theme.spacing(240)};
      display: grid;
      justify-content: right;
    `,
  address: () => css``,
  balance: () => css``,
});

export { createStyles };
