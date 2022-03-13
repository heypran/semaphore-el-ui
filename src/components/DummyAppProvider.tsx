import React, { createContext, useContext, useState, useEffect } from 'react';

import Cookies from 'js-cookie';
// import { addBearerToken } from '../api/api';
import Router from 'next/router';

interface Auth {
  userId?: string; // { email: string; portfolioIds: string[] };
  setToken: (token: string, user: any) => void;
  isAuthenticated: boolean;
  logout: () => void;
  setUser: (user: any) => void;
}

const DummyAuthContext = createContext({} as Auth);

export const DummyAuthProvider = ({ children }: any) => {
  const [userId, setUser] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      const cookie = JSON.parse(token);
      if (cookie) {
        setUser(cookie.userId);
        Router.push('/');
      }
    }
  }, []);

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('userId');
    setUser(undefined);
    Router.push('/');
  };

  const setToken = async (token: string, userId: string) => {
    if (!token || !userId) return;
    Cookies.set('token', JSON.stringify({ token, userId }));
    setUser(userId);
    // addBearerToken(token);
  };

  // @ts-ignore
  const redirectAfterLogout = () => {
    Router.push('/');
  };

  return (
    <DummyAuthContext.Provider
      value={{
        setToken,
        userId,
        setUser,
        // @ts-ignore
        isAuthenticated: !!Cookies?.get('token'),
        logout,
      }}
    >
      {children}
    </DummyAuthContext.Provider>
  );
};

export const useDummyAuth = () => {
  const authContext = useContext(DummyAuthContext);
  return authContext;
};
