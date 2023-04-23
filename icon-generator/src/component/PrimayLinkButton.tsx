import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export function PrimaryLinkButton(
  props: LinkProps &  { children: ReactNode; className?: string }
  ){
    const {className, ...propsWithoutClassName} = props
    return (
    <Link
      className={clsx(
        "rounded px-4 py-2 hover:bg-blue-500",
        props.className ?? "")}
        {...propsWithoutClassName}
    >
      {props.children}
    </Link>
    )
}