export enum LoginState {
  LOGIN,
  LOGOUT,
  BOTH,
}

const navLinksLoggedIn = [
  {
    id: "notes",
    title: "Notes",
    url: "/notes",
    auth: LoginState.LOGIN,
  },
];

export const navLinks = {
  // opening page
  home: [
    {
      id: "home_home",
      title: "Home",
      url: "#home_home",
      auth: LoginState.LOGOUT,
    },
  ],

  // protected pages
  notes: navLinksLoggedIn,
  // ...

  // common pages
  otherpage: navLinksLoggedIn,

  // shows common links(not real link)
  common: [
    {
      id: "common_home",
      title: "Home",
      url: "/",
      auth: LoginState.LOGOUT,
    },
    {
      id: "common_other_page",
      title: "Other page",
      url: "/other_page",
      auth: LoginState.BOTH,
    },
  ],
};
