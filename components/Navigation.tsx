"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { navLinks, LoginState } from "@/config/constants";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LogoSvg, HamburgerSvg } from "@/assets";

type PageLinksMetaArrKeys = "home" | "notes" | "common" | "otherpage";

const Navigation = () => {
  const [active, setActive] = useState("Home");
  const { data: session, status } = useSession();
  const pathName = usePathname();
  const [isOpened, setIsOpened] = useState(false);

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
    <nav className="flex items-center justify-between w-full py-2 px-3 bg-blue-200">
      {/* logo */}
      <Link href="/">
        <div className="flex justify-center items-center">
          <Image
            src={LogoSvg}
            alt="Stacked Notes logo"
            className=" w-16 h-16"
          />
          <h1 className=" text-2xl">Stacked Notes</h1>
        </div>
      </Link>

      <div
        className={`${
          isOpened ? "flex" : "hidden"
        } flex-col lg:flex-row lg:flex lg:items-center lg:justify-between lg:flex-grow`}
      >
        {/* menu items for the current page */}
        <div className="flex flex-grow items-center lg:justify-center">
          <ul className="flex list-style-none flex-col lg:flex-row">
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
        <div className="flex justify-between basis-auto flex-grow items-center">
          <ul className="flex list-style-none flex-col lg:flex-row">
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
        </div>

        {/* User related elements */}
        <div>
          <ul className="flex list-style-none">
            <li className="pl-2" data-te-nav-item-ref>
              {/* Logged out */}
              {!session && (
                <div className="flex flex-col">
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
                  <div className="flex flex-col">
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

      {/* Hamburger button for mobile view */}
      <button
        className="block lg:hidden"
        onClick={(e) => setIsOpened((prev) => !prev)}
      >
        <Image
          src={HamburgerSvg}
          alt="Stacked Notes logo"
          className=" w-16 h-16"
        />
      </button>
    </nav>
  );
};

export default Navigation;
