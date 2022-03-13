import React from 'react';

import { Typography, Card, styled, Box } from '@mui/material';
import { useWeb3React } from '@web3-react/core';

const CardWrapper = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.light,
  width: '300px',
  height: '500px',
  borderRadius: '10px',
  padding: '24px',
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}));

type StepperCardPropsType = {
  title?: string;
  content: React.ReactElement;
};
function StepperCard(props: StepperCardPropsType): React.ReactElement {
  const { account } = useWeb3React();

  return (
    <CardWrapper>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        height="100%"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Title variant="h3" sx={{ mt: '8px', mb: '8px' }}>
            {props.title}
          </Title>
          <SubTitle
            variant={'h5'}
            sx={{
              mt: '8px',
              mb: '16px',
              fontSize: account ? '12px' : '16px',
              wordBreak: 'break-all',
            }}
          >
            {account ? `Account: ${account}` : 'Wallet Status: Not Connected'}
          </SubTitle>
        </Box>
        <Box display="flex" flexDirection="column" flex="1">
          {props.content}
        </Box>
      </Box>
    </CardWrapper>
  );
}

export default StepperCard;
