import { FC } from 'react';
import { SvgIconProps as MUIArrowRightAltIconProps } from '@mui/material';
import MUIWifiProtectedSetupIcon from '@mui/icons-material/WifiProtectedSetup';

type Props = MUIArrowRightAltIconProps;

const WifiProtectedSetup: FC<Props> = ({ ...MUIProps }) => {
  return <MUIWifiProtectedSetupIcon {...MUIProps} />;
};

export type { Props };

export { WifiProtectedSetup };
