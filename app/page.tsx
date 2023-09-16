"use client";

import { NoteContainer, NoteElementImport, SideMenu } from "@/components";

import { GlobalContext } from "@/components/Contexts";

export default function Home() {
  return (
    <div className="min-h-screen">
      <GlobalContext>
        <NoteContainer />
        <NoteElementImport />
        <SideMenu />
      </GlobalContext>
    </div>
  );
}
