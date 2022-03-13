import React from 'react';

import { Box } from '@mui/material';
import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';
import HorizontalLinearStepper from '@components/StepperComponent';
import { DummyAuthProvider } from '@components/DummyAppProvider';
import DummyAuthStatus from '@components/DummyAuthStatus';

const Index = () => {
  return (
    <Main meta={<Meta title="Elefria" description="Elefria- Authentication" />}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <DummyAuthProvider>
          <DummyAuthStatus />
          <HorizontalLinearStepper />
        </DummyAuthProvider>
      </Box>
    </Main>
  );
};

export default Index;
