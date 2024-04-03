import "@mantine/core/styles.css";
import "@mantine/carousel/styles.css";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { Layout } from "./components/Layout";
import { RegisterPage } from "./pages/RegisterPage";
import { LoginPage } from "./pages/LoginPage";
import { SearchPage } from "./pages/SearchPage";
import AuthProvider from "./contexts/AuthContext.jsx";
import { MediaDetailsPage } from "./pages/MediaDetailsPage";
import { ProfilePage } from "./pages/ProfilePage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="signup" element={<RegisterPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="details" element={<MediaDetailsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
