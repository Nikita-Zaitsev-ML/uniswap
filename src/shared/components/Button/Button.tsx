import { forwardRef, PropsWithChildren } from 'react';
import {
  Button as MUIButton,
  ButtonProps as MUIButtonProps,
  useTheme,
} from '@mui/material';

import { createStyles } from './Button.styles';

type Props = MUIButtonProps & { rounded?: boolean };

const Button = forwardRef<HTMLButtonElement, PropsWithChildren<Props>>(
  ({ rounded, ...MUIProps }, ref) => {
    const theme = useTheme();
    const styles = createStyles({ rounded }, theme);

    return <MUIButton css={styles.root()} {...MUIProps} ref={ref} />;
  }
);

Button.displayName = 'Button';

export type { Props };

export { Button };
