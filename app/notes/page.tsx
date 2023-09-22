"use client";

import React from 'react'
import { NoteContainer, SideMenu } from "@/components";
import { GlobalContext } from "@/components/Contexts";

export default function NotesPage() {
  return (
    <div className=" min-w-full h-screen">
      <GlobalContext>
        <div>
          <SideMenu />
          <NoteContainer />
        </div>
      </GlobalContext>
    </div>
  );
}