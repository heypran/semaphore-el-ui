import { ReactNode } from 'react';
// import MiniDrawer, { DrawerHeader } from '@components/Drawer';
import useEagerConnect from '@/hooks/useEagerConnect';

type IMainProps = {
  meta: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => {
  useEagerConnect();
  return (
    <div>
      {props.meta}
      <div>
        <div>{/* <MiniDrawer /> */}</div>
        {/* <DrawerHeader /> */}
        {/* TODO make this dynamic */}
        <div style={{ paddingLeft: '60px', paddingTop: '40px' }}>
          {props.children}
        </div>
      </div>
    </div>
  );
};
export { Main };
