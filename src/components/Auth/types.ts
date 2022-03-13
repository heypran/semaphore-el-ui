import { Dispatch, SetStateAction } from 'react';

export type StepperComponentPropsType = {
  setActiveStep: Dispatch<SetStateAction<number>>;
};
