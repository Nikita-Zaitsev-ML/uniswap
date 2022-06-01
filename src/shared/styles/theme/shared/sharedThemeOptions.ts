import { CSSProperties } from 'react';
import { ThemeOptions } from '@mui/material';

import { ROOT_FONT_SIZE } from 'src/shared/styles/base/constants';

declare module '@mui/material/styles' {
  interface Theme {
    cursor: {
      grab: CSSProperties['cursor'];
      grabbing: CSSProperties['cursor'];
    };
    gradients: {
      linear: {};
      radial: {
        main: CSSProperties['backgroundImage'];
      };
    };
  }
  interface ThemeOptions {
    cursor?: {
      grab?: CSSProperties['cursor'];
      grabbing?: CSSProperties['cursor'];
    };
    gradients?: {
      linear?: {};
      radial?: {
        main?: CSSProperties['backgroundImage'];
      };
    };
  }
}

declare module '@mui/material/styles/createPalette' {
  interface CommonColors {
    midnight: CSSProperties['color'];
    linkWater: CSSProperties['color'];
  }
  interface TypeBackground {
    paperLight: CSSProperties['color'];
  }
}

const sharedThemeOptions: ThemeOptions = {
  palette: {
    common: {
      midnight: '#001B45',
      linkWater: '#d8e1f3',
    },
  },

  spacing: (
    top?: number | string,
    right?: number | string,
    bottom?: number | string,
    left?: number | string
  ) =>
    [top, right, bottom, left]
      .map((factor) =>
        typeof factor === 'number' ? `${factor / ROOT_FONT_SIZE}rem` : factor
      )
      .join(' '),
  components: {
    MuiUseMediaQuery: {
      defaultProps: {
        noSsr: false,
      },
    },
  },
  cursor: { grab: 'grab', grabbing: 'grabbing' },
};

export { sharedThemeOptions };
