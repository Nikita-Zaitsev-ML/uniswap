import { createTheme } from '@mui/material';

import { lightTheme as sharedLightTheme } from 'src/shared/styles/theme';

import { sharedThemeOptions } from '../shared';

const lightTheme = createTheme(sharedLightTheme, sharedThemeOptions, {
  palette: { secondary: { main: '#e8006f', dark: '#cf0063' } },
});

export { lightTheme };
