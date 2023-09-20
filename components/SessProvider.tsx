'use client';

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

const SessProvider = ({ children, session }: {children : React.ReactNode, session: Session}) => (
  <SessionProvider session={session}>
    {children}
  </SessionProvider>
)

export default SessProvider;