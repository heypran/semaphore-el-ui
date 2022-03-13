import React from 'react';

import { Typography, Card, styled, useTheme, Box } from '@mui/material';
import { useWeb3React } from '@web3-react/core';

const CardWrapper = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: theme.palette.primary.light,
  position: 'relative',
  width: '700px',
  height: '50px',
}));

function CardComponent(): React.ReactElement {
  const { account } = useWeb3React();
  const theme = useTheme();
  return (
    <CardWrapper>
      <Box display="flex" justifyContent="center" alignContent="center">
        <Typography
          variant="h5"
          style={{ color: `${theme.palette.primary.light}` }}
        >
          {account ? `Connect as: ${account}` : `Please connect your wallet`}
        </Typography>
      </Box>
    </CardWrapper>
  );
}

export default CardComponent;
