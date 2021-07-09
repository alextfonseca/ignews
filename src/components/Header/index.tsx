import { SignInButton } from "../SignInButton";
import styles from "./styles.module.scss"; //importando os estilos

import { ActiveLink } from "../ActiveLink/index";

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <img src="/images/logo.svg" alt="logo escrito ignews" />
        <nav>
          <ActiveLink activeClass={styles.active} href="/">
            <a>Home</a>
          </ActiveLink>

          <ActiveLink activeClass={styles.active} href="/posts" prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}

// o prefetch ja deixa a pagina carregada antes de acessar
