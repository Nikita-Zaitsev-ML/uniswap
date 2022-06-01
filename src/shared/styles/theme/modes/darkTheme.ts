import { createTheme } from '@mui/material';

import { sharedThemeOptions } from '../shared/sharedThemeOptions';

const defaultDarkTheme = createTheme({ palette: { mode: 'dark' } });

const darkTheme = createTheme(defaultDarkTheme, sharedThemeOptions, {
  palette: { background: { paperLight: '#191b1f' } },
});

export { darkTheme };
