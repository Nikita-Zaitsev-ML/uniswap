import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

const createStyles = (theme: Theme) => ({
  root: () => css``,
  adornment: () =>
    css`
      width: 7rem;
    `,
  autocomplete: () => css`
    width: 7rem;
  `,
  option: () => css``,
  optionAvatar: () => css`
    flex: 0 1 35%;
  `,
  optionText: () =>
    css`
      flex: 0 1 65%;
      margin-left: ${theme.spacing(8)};
    `,
  caption: () => css`
    display: grid;
    grid: 'balance' 'max' 'btn' / 100%;
    width: 100%;
    justify-content: space-between;
    cursor: auto;
  `,
  addMaxBtn: () => css`
    grid-area: btn;
    display: box;
    line-clamp: 1;
    overflow: hidden;
    max-width: 7rem;
  `,
  captionMax: () => css`
    grid-area: max;
  `,
  captionBalance: () => css`
    grid-area: balance;
    display: box;
    line-clamp: 1;
    overflow: hidden;
    max-width: 7rem;
  `,
});

export { createStyles };
