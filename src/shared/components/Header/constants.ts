import { NavigationItem } from './types';

const defaultNavigationItems: NavigationItem[] = [
  {
    key: 'Home',
    href: '/mock',
    'aria-label': 'Home',
    children: 'Home',
    isCurrentPage: true,
  },
  { key: 'Title1', href: '/mock', 'aria-label': 'Title1', children: 'Title1' },
  { key: 'Title2', href: '/mock', 'aria-label': 'Title2', children: 'Title2' },
];

export { defaultNavigationItems };
