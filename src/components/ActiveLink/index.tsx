import { useRouter } from "next/dist/client/router";
import Link, { LinkProps } from "next/link";
import { ReactElement, cloneElement } from "react";

// tipando os dados que ficam dentro do Link
interface ActiveLinkProps extends LinkProps {
  children: ReactElement; //referente ao a dentro do html link
  activeClass: string; // classe que vai ser passado para o elemento
}

export function ActiveLink({
  children,
  activeClass,
  ...props
}: ActiveLinkProps) {
  const { asPath } = useRouter();

  const className = asPath === props.href ? activeClass : "";

  return (
    // clonando o a tag <a> e adicionando a classe no elemento
    <Link {...props}>
      {cloneElement(children, {
        className,
      })}
    </Link>
  );
}
