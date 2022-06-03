import { FC, ReactElement } from 'react';
import { useTheme } from '@mui/material';

import { Box } from 'src/shared/components';
import { useNet } from 'src/shared/helpers/react/hooks/vanta';

import { createStyles } from './DefaultLayout.style';

type Props = {
  header?: ReactElement;
};

const DefaultLayout: FC<Props> = ({ children, header }) => {
  const theme = useTheme();
  const styles = createStyles({ header }, theme);

  const backGroundRef = useNet({
    points: 20,
    maxDistance: 20,
    spacing: 20,
  });

  return (
    <>
      <Box css={styles.root()} ref={backGroundRef}>
        {header && <Box css={styles.header()}>{header}</Box>}
        <Box css={styles.content()}>{children}</Box>
      </Box>
    </>
  );
};

export type { Props };

export { DefaultLayout };
