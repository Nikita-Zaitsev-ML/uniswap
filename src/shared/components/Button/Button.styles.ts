import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

import type { Props } from './Button';

const createStyles = (props: Pick<Props, 'rounded'>, theme: Theme) => ({
  root: () => {
    const rounded = props.rounded
      ? css`
          border-radius: ${theme.spacing(24)};
        `
      : css``;

    return css`
      ${rounded}
    `;
  },
});

export { createStyles };
