import React from 'react';

import { Typography, Card, styled, Box } from '@mui/material';
import { useDummyAuth } from './DummyAppProvider';

const CardWrapper = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.primary.light,
  width: '300px',
  height: '40px',
  borderRadius: '10px',
  padding: '8px',
  display: 'flex',
  flexDirection: 'column',
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

function DummyAuthStatus(): React.ReactElement {
  const { userId } = useDummyAuth();

  return (
    <CardWrapper>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        height="100%"
      >
        <Title variant="h3" sx={{ mt: '4px' }}>
          {userId ? 'Autheticated!' : 'Not Authenticated!'}
        </Title>
      </Box>
    </CardWrapper>
  );
}

export default DummyAuthStatus;
