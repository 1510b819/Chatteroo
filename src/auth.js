import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export const login = () => signInWithPopup(auth, provider);

export default auth;