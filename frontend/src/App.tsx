import { useEffect } from "react";
import { getTheme, setTheme } from "./utils/theme";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorPage from "./public_pages/ErrorPage";
import Login from "./public_pages/Login";
import Register from "./public_pages/Register";
import LandingPage from "./public_pages/LandingPage";
import PrivateLayout from "./layouts/PrivateLayout";
import Dashboard from "./private_pages/Dashboard";
import Account from "./private_pages/Account";
import PublicLayout from "./layouts/PublicLayout";
import About from "./public_pages/About";
import Changelogs from "./public_pages/Changelogs";
import SlideToTop from "./components/SlideToTop";
import PrivacyPolicy from "./public_pages/PrivacyPolicy";
import TermsConditions from "./public_pages/TermsConditions";
import PublicLayoutRedirect from "./layouts/PublicLayoutRedirect";
import Users from "./private_pages/Users";
import Reports from "./private_pages/Reports";

const PUBLIC_PAGES = [
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <About /> },
  { path: "/changelogs", element: <Changelogs /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-and-conditions", element: <TermsConditions /> },
];

const PUBLIC_PAGES_REDIRECT = [
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
];

const PRIVATE_PAGES = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/account", element: <Account /> },
  { path: "/users", element: <Users /> },
  { path: "/reports", element: <Reports /> },
];

export default function App() {

  // Theme initializer
  useEffect(() => {
    setTheme(getTheme());
  }, []);

  return (
    <BrowserRouter>
      <SlideToTop/>
      <Routes>

        {/* Public pages without any layout */}
        <Route element={<PublicLayoutRedirect/>}>
          {PUBLIC_PAGES_REDIRECT.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Public pages with navbar layout */}
        <Route element={<PublicLayout/>}>
          {PUBLIC_PAGES.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Private pages (with sidebar layout) */}
        <Route element={<PrivateLayout />}>
          {PRIVATE_PAGES.map((page, i) => (
            <Route key={i} path={page.path} element={page.element} />
          ))}
        </Route>

        {/* Error page */}
        <Route path="*" element={<ErrorPage />} />

      </Routes>
    </BrowserRouter>
  );
}