import React from 'react';

import TextareaAutosize from '@mui/material/TextareaAutosize';

import { Meta } from '@/layout/Meta';
import { Main } from '@/templates/Main';

const Dashboard = () => (
  <Main meta={<Meta title="Lorem ipsum" description="Lorem ipsum" />}>
    <TextareaAutosize
      aria-label="minimum height"
      minRows={3}
      placeholder="Minimum 3 rows"
      style={{ width: 200 }}
    />
  </Main>
);

export default Dashboard;
