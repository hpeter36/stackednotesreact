"use client";

import { NoteContainer, NoteElementImport } from "@/components";

import { GlobalContext } from "@/components/Contexts";

export default function Home() {

  return (
    <div className="min-h-screen">
      <GlobalContext>
        <NoteContainer />
        <NoteElementImport />
      </GlobalContext>
    </div>
  );
}
