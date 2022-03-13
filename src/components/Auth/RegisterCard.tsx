import React from 'react';

import { Box, styled, Typography } from '@mui/material';
import StepperCard from '../common/StepperCard';
import BaseButton from '@components/common/BaseButton';
import { StepperComponentPropsType } from './types';
import { ElefriaSteps } from '@components/common/types';

const RegisterDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  mb: '16px',
}));

type RegisterCardPropsType = StepperComponentPropsType & {};

function RegisterCard(props: RegisterCardPropsType): React.ReactElement {
  return (
    <StepperCard
      title={'Elefria: Registration'}
      content={
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
          flex={1}
        >
          <RegisterDescription>
            Next screen will show your identity strings ( idT,nH) These together
            forms your identity on any platform. However, these are never
            disclosed during authentication Please back them up safely, just
            like you save your wallet keys. Please make sure no one is looking
            at your screen.
          </RegisterDescription>
          <BaseButton
            variant="contained"
            onClick={() =>
              props.setActiveStep(ElefriaSteps.CommitmentGeneration)
            }
          >
            Proceed
          </BaseButton>
        </Box>
      }
    />
  );
}

export default RegisterCard;
