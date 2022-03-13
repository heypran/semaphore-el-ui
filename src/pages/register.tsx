import React from 'react';

import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';
import Register from '@components/Register/Register';

const RegisterPage = () => (
  <Main meta={<Meta title="Lorem ipsum" description="Lorem ipsum" />}>
    <Register />
  </Main>
);

export default RegisterPage;
