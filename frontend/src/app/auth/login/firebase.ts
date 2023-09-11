import exp from "constants";
import type { Auth, AuthError, AuthProvider, User } from "firebase/auth";
import {
    browserPopupRedirectResolver,
    GoogleAuthProvider,
    GithubAuthProvider,
    linkWithPopup,
    signInWithPopup,
    signOut,
    useDeviceLanguage,
    FacebookAuthProvider,
} from "firebase/auth";

const CREDENTIAL_ALREDY_IN_USE_ERROR = "auth/credential-already-in-use";
export const isCredentialAlreadyInUseError = (error: AuthError) => 
    error?.code === CREDENTIAL_ALREDY_IN_USE_ERROR;

export const logout = async (auth: Auth): Promise<void> => {
    return signOut(auth);
};

export const getFacebookProvider = (auth: Auth) => {
    const provider = new FacebookAuthProvider();
    provider.addScope("public_profile");
    provider.setDefaultLanguage('en')
    //useDeviceLanguage(auth);
    provider.setCustomParameters({
        display: "popup",
    });

    return provider;
};

export const getGoogleProvider = (auth: Auth) => {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    provider.setDefaultLanguage('en')
    //useDeviceLanguage(auth);
    provider.setCustomParameters({
        display: "popup",
    });

    return provider;
};

export const getGithubProvider = (auth: Auth) => {
    const provider = new GithubAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    provider.setDefaultLanguage('en')
    //useDeviceLanguage(auth);
    provider.setCustomParameters({
        display: "popup",
    });

    return provider;
}

export const loginWithProvider = async (
    auth: Auth,
    provider: AuthProvider
): Promise<User> => {
    const result = await signInWithPopup(
        auth,
        provider,
        browserPopupRedirectResolver
    );

    return result.user;
}

export const linkWithProvider = async (
    auth: Auth,
    provider: AuthProvider
): Promise<User> => {
    const result = await linkWithPopup(
        auth.currentUser as User,
        provider,
        browserPopupRedirectResolver
    );

    return result.user;
}