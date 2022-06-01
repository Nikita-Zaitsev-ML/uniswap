import { FC } from 'react';
import { useTheme } from '@mui/material';

import { Props as LinkProps } from '../../Link/Link';
import { Breadcrumbs } from '../../Breadcrumbs/Breadcrumbs';
import { NavigationItem } from '../types';
import { createStyles } from './Navigation.style';

type Props = {
  items: NavigationItem[];
};

const Navigation: FC<Props> = ({ items }) => {
  const theme = useTheme();
  const styles = createStyles({}, theme);

  const breadcrumbsItems: LinkProps[] = items.map((item) => {
    const { isCurrentPage, ...theRest } = item;
    const ariaCurrent = isCurrentPage && 'page';

    return {
      isActive: isCurrentPage,
      underline: 'none',
      'aria-current': ariaCurrent,
      ...theRest,
    };
  });

  return (
    <>
      <Breadcrumbs
        css={styles.root()}
        separator=""
        aria-label="хлебные крошки"
        items={breadcrumbsItems}
        variant="rounded"
      />
    </>
  );
};

export type { Props };

export { Navigation };
