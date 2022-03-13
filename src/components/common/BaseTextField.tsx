import React from 'react';

import { styled, TextField, IconButton, TextFieldProps } from '@mui/material';
import { CopyAllOutlined } from '@mui/icons-material';

const CustomTextField = styled(TextField)((_) => ({}));

type BaseTextFieldPropsType = TextFieldProps & {
  onCopyClick?: () => void;
  showCopy?: boolean;
};
function BaseTextField(props: BaseTextFieldPropsType): React.ReactElement {
  const { showCopy = true } = props;
  return (
    <CustomTextField
      variant="outlined"
      InputProps={{
        endAdornment: showCopy ? (
          <IconButton onClick={props.onCopyClick}>
            <CopyAllOutlined />
          </IconButton>
        ) : (
          <></>
        ),
      }}
      {...props}
    />
  );
}

export default BaseTextField;
