import { ThemeOptions } from '@mui/material';

const sharedThemeOptions: ThemeOptions = {
  typography: { caption: { color: '#bdbdbd' } },
  gradients: {
    radial: {
      main: 'radial-gradient(50% 50% at 50% 0%, #fc077d10 0, rgba(255, 255, 255, 0) 100% )',
    },
  },
};

export { sharedThemeOptions };
