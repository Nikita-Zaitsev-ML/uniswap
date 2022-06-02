import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

const createStyles = (theme: Theme) => ({
  root: () => css``,
  hint: () => css`
    display: grid;
    row-gap: ${theme.spacing(4)};
    word-break: break-word;
  `,

  insufficientAmount: () => css``,
  proportion: () => css``,
  commission: () => css``,
  slippage: () => css``,
});

export { createStyles };
