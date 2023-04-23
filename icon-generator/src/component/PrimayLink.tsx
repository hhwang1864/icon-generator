import Link, { LinkProps } from "next/link";
import { ReactNode } from "react";

export function PrimaryLink(
  props: LinkProps &  { children: ReactNode }
  ){
    return (
    <Link className="hover:text-cyan-500"{...props}>{props.children}</Link>
    )
}