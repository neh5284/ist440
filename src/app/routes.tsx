import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { AlbumDetail } from "./pages/AlbumDetail";
import { ArtistPage } from "./pages/ArtistPage";
import { Charts } from "./pages/Charts";
import { Profile } from "./pages/Profile";
import { Search } from "./pages/Search";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "album/:id", Component: AlbumDetail },
      { path: "artist/:id", Component: ArtistPage },
      { path: "charts", Component: Charts },
      { path: "profile", Component: Profile },
      { path: "search", Component: Search },
    ],
  },
]);