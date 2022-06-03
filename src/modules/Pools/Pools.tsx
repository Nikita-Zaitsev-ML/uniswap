import { DefaultLayout } from 'src/modules/shared/pageTemplates';
import { Head, Header } from 'src/modules/shared/components';
import { Provider as ProviderFeature } from 'src/features/Provider/Provider';
import type { NextPageWithLayout } from 'src/shared/types';
import { Box, Container, Typography } from 'src/shared/components';

import { useAuth } from '../shared/hooks';
import { createStyles } from './Pools.style';

const Pools: NextPageWithLayout = () => {
  const styles = createStyles();

  const { connection, user, error, onAuth } = useAuth();

  return (
    <>
      <Head title="Пулы" keywords="" description="" />
      <DefaultLayout header={<Header user={user} onAuth={onAuth} />}>
        <Container>
          <Box css={styles.root()} component="main">
            <Box css={styles.grid()}>
              {error === '' ? (
                <ProviderFeature
                  userAddress={user?.address || ''}
                  provider={connection && connection.provider}
                  signer={connection && connection.signer}
                  view={'Pools'}
                />
              ) : (
                <Typography color="error">{error}</Typography>
              )}
            </Box>
          </Box>
        </Container>
      </DefaultLayout>
    </>
  );
};

Pools.getLayout = (page) => {
  return page;
};

export { Pools };
