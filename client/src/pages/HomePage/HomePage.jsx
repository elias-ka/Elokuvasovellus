import { SearchBar } from "../../components/SearchBar";
import Trending from "./Trending.jsx";
import Recommendations from "./Recommendations.jsx";
import { Container, useMantineTheme } from "@mantine/core";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useMediaQuery } from "@mantine/hooks";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    sessionStorage.removeItem("searchText");
    navigate("/search", { state: { query: searchText } });
  };

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Container size="xl" mt="lg" mb="xl" px={mobile ? "xs" : "lg"}>
      <Container size="sm">
        <form onSubmit={handleSubmit}>
          <SearchBar
            placeholder="Search movies and TV shows"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>
      </Container>
      <Trending />
      {isLoggedIn && <Recommendations />}
    </Container>
  );
}
