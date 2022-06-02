import { css } from '@mui/material';

import { Theme } from 'src/shared/styles/theme';

const createStyles = (theme: Theme) => ({
  root: () => css`
    width: ${theme.spacing(400)};
    border-radius: ${theme.spacing(24)};
    background: ${theme.palette.background.paper};
    box-shadow: ${theme.shadows[13]};
  `,
  header: () => css`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  `,
  title: () => css`
    flex: 0 1 65%;
  `,
  panel: () => css`
    display: grid;
    gap: ${theme.spacing(8)};
  `,
  arrow: () => css`
    display: flex;
    justify-content: center;
  `,
  slippage: () => css``,
  slippageTitle: () => css``,
  slippageSlider: () => css`
    padding-left: ${theme.spacing(8)};
    padding-right: ${theme.spacing(8)};
  `,
});

export { createStyles };
