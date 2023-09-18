"use client";

import { NoteContainer, SideMenu } from "@/components";

import { GlobalContext } from "@/components/Contexts";

export default function Home() {
  return (
    <div className=" min-w-full h-screen">
      <GlobalContext>
        <div className="flex">
          <SideMenu />
          <NoteContainer />
        </div>
      </GlobalContext>
    </div>
  );
}
