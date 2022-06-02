import { FC } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@mui/material';

import {
  Header as HeaderComponent,
  Box,
  Button,
  Typography,
} from 'src/shared/components';
import { BigNumber } from 'src/shared/helpers/blockchain/numbers';

import { Logo } from '../Icons';
import { routes, items } from './constants';
import { createStyles } from './Header.style';

type Props = {
  user: { address: string; balance: string } | null;
  onAuth?: () => Promise<void>;
};

const Header: FC<Props> = ({ user, onAuth }) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { pathname } = useRouter();
  const navigation = {
    items: items.map((item) => {
      const { key, title, href } = item;
      const isCurrentPage =
        href === routes.root ? pathname === href : pathname.startsWith(href);

      return {
        key,
        'aria-label': item['aria-label'],
        children: title,
        href,
        isCurrentPage,
      };
    }),
  };

  const handleAuthClick = async () => {
    onAuth?.();
  };

  return (
    <HeaderComponent
      css={styles.root()}
      logo={<Logo css={styles.logo()} />}
      navigation={navigation}
      settings={
        <>
          {user === null ? (
            <Button
              css={styles.auth()}
              variant="contained"
              size="small"
              color="secondary"
              rounded
              onClick={handleAuthClick}
            >
              Подключить кошелек
            </Button>
          ) : (
            <Box css={styles.user()}>
              <Typography css={styles.address()} variant="subtitle2" noWrap>
                Адрес:{' '}
                {`${user.address.slice(0, 5)}..${user.address.slice(-3)}`}
              </Typography>
              <Typography css={styles.balance()} variant="subtitle2" noWrap>
                Баланс: {new BigNumber(user.balance).toFixed(2)} ETH
              </Typography>
            </Box>
          )}
        </>
      }
      position="fixed"
    />
  );
};

export type { Props };

export { Header };
