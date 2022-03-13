import React from 'react';

import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';
import HorizontalLinearStepper from '@components/StepperComponent';

const Stepper = () => (
  <Main meta={<Meta title="Lorem ipsum" description="Lorem ipsum" />}>
    <HorizontalLinearStepper />
  </Main>
);

export default Stepper;
