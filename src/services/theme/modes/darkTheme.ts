import { createTheme } from '@mui/material';

import { darkTheme as sharedDarkTheme } from 'src/shared/styles/theme';

import { sharedThemeOptions } from '../shared';

const darkTheme = createTheme(sharedDarkTheme, sharedThemeOptions, {
  palette: {
    primary: {
      contrastText: '#ffffff',
    },
    secondary: { main: '#2172e5', dark: '#1966d4', contrastText: '#ffffff' },
    background: { paper: '#191b1f' },
  },
});

export { darkTheme };
