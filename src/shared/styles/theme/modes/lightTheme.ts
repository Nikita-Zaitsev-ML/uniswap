import { createTheme } from '@mui/material';

import { sharedThemeOptions } from '../shared/sharedThemeOptions';

const lightTheme = createTheme(sharedThemeOptions, {
  palette: { background: { paperLight: '#f7f8fa' } },
});

export { lightTheme };
