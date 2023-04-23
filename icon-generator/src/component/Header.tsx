import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "./Button";
import { useBuyCredits } from "~/hooks/useByCredits";

export function Header() {

  const session = useSession()
  const { buyCredits } = useBuyCredits();
  const isLoggedIn = !!session.data
  return <header className="container mx-auto flex h-16 justify-between items-center px-4 dark:bg-gray-800">

    <Link href="/" className="hover:text-cyan-500">
      Icon Generator
    </Link>
    <ul>
      <li><Link href="/generate">Generate</Link></li>
    </ul>
    <ul className="flex gap-4">
      {isLoggedIn && (
        <>
          <li>
            <Button
              variant="secondary"
                onClick={() => {
                  signOut().catch(console.error);
                }}
              >
                Logout
              </Button>
            </li>
          <li>
            <Button
              onClick={() => {
                buyCredits().catch(console.error);
              }}
            >
              Buy Credits
            </Button>
          </li>
        </>
        )
      }
      {!isLoggedIn && (
          <li>
            <Button
                onClick={() => {
                  signIn().catch(console.error);
                }}
              >
                Login
              </Button>
          </li>)
      }
    </ul>
  </header>
}