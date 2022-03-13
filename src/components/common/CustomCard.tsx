import React from 'react';

import { Typography, Card, styled, Box } from '@mui/material';
import BaseButton from './BaseButton';

const CardWrapper = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.light,
  width: '300px',
  height: '500px',
  borderRadius: '10px',
  padding: '8px',
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

function CustomCard(): React.ReactElement {
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
          {'Elefria'}
        </Title>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          flex={1}
        >
          <BaseButton variant="contained" sx={{ mb: '16px' }}>
            Login
          </BaseButton>

          <BaseButton variant="contained">Register</BaseButton>
        </Box>
      </Box>
    </CardWrapper>
  );
}

export default CustomCard;
