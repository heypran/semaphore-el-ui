import * as React from 'react';

import LinearProgress from '@mui/material/LinearProgress';

type LinearLoaderPropsType = {
  isLoading?: boolean;
};
export default function LinearLoader(
  props: LinearLoaderPropsType,
): React.ReactElement {
  const { isLoading = false } = props;
  if (isLoading) {
    return <LinearProgress />;
  }
  return <></>;
}
