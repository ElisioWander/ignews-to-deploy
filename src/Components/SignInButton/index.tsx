import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";

import { useSession, signIn, signOut } from "next-auth/react";

import styles from "./styles.module.scss";

export function SignInButton() {
    //session vai saber se o usuário está autenticado e trazer as informações 
    //que foram estabelecidas dentro do provider no arquivo [...nextauth] na parte 
    //de escopo 
  const {data: session} = useSession()

  return session ? (
    <button 
        type="button"
        className={styles.signInButton}
        onClick={() => signOut()}
    >
      <FaGithub color="#04D361" />
      {session.user.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("github")}
    >
      <FaGithub color="#EBA417" />
      Sign in with Github
    </button>
  );
}
