'use client';

import * as React from 'react';
import type { UserInfo } from 'firebase/auth';
import { Claims } from 'next-firebase-auth-edge/lib/auth/claims';

export interface User extends Omit<UserInfo, 'providerId'> {
    emailVerified: boolean;
    customClaims: Claims;
};

export interface AuthContextValue {
    user: User | null;
};

export const AuthContext = React.createContext<AuthContextValue>({
    user: null,
});

export const useAuth = () => React.useContext(AuthContext);