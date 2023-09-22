"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { navLinks, LoginState } from "@/config/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";

type PageLinksMetaArrKeys = "home" | "notes" | "common" | "otherpage";

const Navigation = () => {
  const [active, setActive] = useState("Home");
  const { data: session, status } = useSession();
  const pathName = usePathname();

  function getPageLinksMetaArrKey(page_url: string): PageLinksMetaArrKeys {
    switch (page_url) {
      case "/":
        return "home";

      // protected pages
      case "/notes":
        return "notes";

      // commmon pages
        case "/other_page":
          return "otherpage";

      // common
      case "common":
        return "common";
      default:
        return "home";
    }
  }

  return (
    <nav className="z-10 flex items-center justify-between w-full py-2 ">
      <div className="flex flex-wrap items-center justify-between w-full px-3">
        {/* menu items for the current page */}
        <div className="flex basis-auto flex-grow items-center">
          <ul className="flex list-style-none">
            {navLinks[getPageLinksMetaArrKey(pathName)].map((navObj) => {
              if (
                (navObj.auth === LoginState.LOGOUT && !session) || // logout only pages
                (navObj.auth === LoginState.LOGIN && session) || // login only pages
                navObj.auth === LoginState.BOTH
              ) {
                return (
                  <li className="pl-2" key={navObj.id}>
                    <Link
                      href={navObj.url}
                      onClick={(e) => setActive(navObj.title)}
                    >
                      {navObj.title}
                    </Link>
                  </li>
                );
              }
            })}

            {/* not logged in and "/" route, show log in link */}
            {pathName === "/" && !session && (
              <li className="pl-2">
                <Link
                  href="/api/auth/signin"
                  onClick={(e) => {
                    e.preventDefault();
                    signIn(undefined, {
                      redirect: true,
                      callbackUrl: `${window.location.origin}/notes`,
                    });
                  }}
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* common links */}
        <div className="flex basis-auto flex-grow items-center">
          <ul className="flex list-style-none">
            {navLinks["common"].map((navObj) => {
              if (
                (navObj.auth === LoginState.LOGOUT && !session) || // logout only pages
                (navObj.auth === LoginState.LOGIN && session) || // login only pages
                navObj.auth === LoginState.BOTH
              ) {
                return (
                  <li className="pl-2" key={navObj.id}>
                    <Link
                      href={navObj.url}
                      onClick={(e) => setActive(navObj.title)}
                    >
                      {navObj.title}
                    </Link>
                  </li>
                );
              }
            })}
          </ul>
          {/* User related elements */}
          <ul className="flex list-style-none">
            <li className="pl-2" data-te-nav-item-ref>
              {/* Logged out */}
              {!session && (
                <div>
                  <Link
                    href={`/api/auth/signin`}
                    onClick={(e) => {
                      e.preventDefault();
                      signIn(undefined, {
                        redirect: true,
                        callbackUrl: `${window.location.origin}/notes`,
                      });
                    }}
                  >
                    Sign in
                  </Link>
                </div>
              )}

              {/* Logged in */}
              {session?.user && (
                <>
                  {/* logged in user related functions */}

                  {/* sign out */}
                  <div>
                    <span>
                      <strong>
                        {session?.user?.email ?? session?.user?.name}
                      </strong>
                    </span>
                    <Link
                      href={`/api/auth/signout`}
                      onClick={(e) => {
                        e.preventDefault();
                        signOut({
                          redirect: true,
                          callbackUrl: `${window.location.origin}`,
                        });
                      }}
                    >
                      Sign out
                    </Link>
                  </div>
                </>
              )}
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
