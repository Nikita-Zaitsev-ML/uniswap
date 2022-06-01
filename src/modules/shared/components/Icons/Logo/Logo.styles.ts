import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

const createStyles = (props: {}, theme: Theme) => ({
  root: () => css`
    font-size: ${theme.typography.pxToRem(28)};
    stroke: ${theme.palette.text.primary};
  `,
});

export { createStyles };
