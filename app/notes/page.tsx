"use client";

import React from "react";
import { NoteContainer, SideMenu } from "@/components";
import { GlobalContext } from "@/components/Contexts";

export default function NotesPage() {
  return (
    <div className="min-w-full h-screen max-h-screen overflow-y-auto">
      <GlobalContext>
        <SideMenu initialStateOpened={false} />
        <NoteContainer />
      </GlobalContext>
    </div>
  );
}
