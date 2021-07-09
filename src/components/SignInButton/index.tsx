// importando icones
import { FaGithub } from "react-icons/fa";
import { FiX } from "react-icons/fi";
// importando os estilos
import styles from "./styles.module.scss";

// importando os componentes para fazer o login com github
import { signIn, useSession, signOut } from "next-auth/client";

export function SignInButton() {
  const [session] = useSession(); // verifica se o usuario esta logado

  return session ? (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signOut()}
    >
      <FaGithub color="#04d361" />
      {session.user.name}
      <FiX color="#737380" className={styles.closeIcon} />
    </button>
  ) : (
    <button
      type="button"
      className={styles.signInButton}
      onClick={() => signIn("github")}
    >
      <FaGithub color="#eba417" />
      Sign in with github
    </button>
  );
}
