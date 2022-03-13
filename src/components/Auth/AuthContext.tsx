import React from 'react';

export type ZkIdType =
  | undefined
  | {
      idt: bigint;
      nullifier: bigint;
      password?: string;
      serialized: string;
    };

type AuthContextProviderPropsType = {
  children: React.ReactElement;
};
const defaultValue: ZkIdType = undefined;
export type AuthContextProviderType = {
  zkIdentity: ZkIdType;
  setZkIdentity: React.Dispatch<React.SetStateAction<ZkIdType>>;
};

const AuthContext = React.createContext<AuthContextProviderType>(
  {} as AuthContextProviderType,
);

function AuthContextProvider(props: AuthContextProviderPropsType) {
  const [zkIdentity, setZkIdentity] = React.useState(defaultValue);

  return (
    <AuthContext.Provider value={{ zkIdentity, setZkIdentity }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContextProvider;

export const useAuthProvider = (): AuthContextProviderType => {
  const authContext = React.useContext(AuthContext);
  if (Object.keys(authContext).length === 0) {
    throw new Error(`Missing AuthContext provider`);
  }
  return authContext;
};
