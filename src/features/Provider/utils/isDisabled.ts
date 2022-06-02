import { REQUEST_STATUS } from 'src/shared/helpers/redux';

import { State } from '../types';

const isDisabled = (
  status: State['status'],
  shouldUpdateData: State['shouldUpdateData']
) => {
  return status !== REQUEST_STATUS.fulfilled || shouldUpdateData;
};

export { isDisabled };
