"use client";

import { NoteElement, NoteElementImport } from "@/components";
import { GlobalContext } from "@/components/Contexts";

export default function Home() {

  return (
    <div className="min-h-screen">
      <GlobalContext>
        <NoteElement title="" id={-10}childrenElements={[]}  parentActions = {null} />
        <NoteElementImport />
      </GlobalContext>
    </div>
  );
}
