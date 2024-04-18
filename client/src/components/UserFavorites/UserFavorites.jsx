import { useEffect, useState } from "react";
import { MovieCard } from "../../components/MovieCard";
import { Carousel } from "@mantine/carousel";
import useAuth from "../../hooks/useAuth";
import { Button, ActionIcon, Tooltip, rem, Group } from "@mantine/core";
import { getFavorites } from "../../data/favorites.js";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";

export default function UserFavorites() {
  const { username, userId } = useAuth();
  const [favorites, setFavorites] = useState(null);
  const listId = userId;
  const baseUrl = import.meta.env.VITE_BASE_URL;
  // const baseUrl = import.meta.env.BASE_URL
  const shareLink = `${baseUrl}/shared-favorites/${listId}`;

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const result = await getFavorites(username);
      // Muutetaan data ennen tilaan tallentamista
      // (MovieCard - komponentti odottaa "media_type", "poster_path" ja "id" - kenttiä)
      const modifiedMedia = result.map((media) => ({
        ...media,
        media_type: media.type,
        poster_path: media.poster_url,
        id: media.tmdb_id,
      }));
      setFavorites(modifiedMedia);
    } catch (error) {
      console.error(error);
    }
  };

  // If not null, map favorites
  const favoritesSlide = favorites
    ? favorites.map((entry) => (
        <Carousel.Slide key={entry.id}>
          <MovieCard movie={entry} />
        </Carousel.Slide>
      ))
    : null;

  const copyUrlButton = (
    <Tooltip label="Copy favorites list URL">
      <ActionIcon
        size={42}
        variant="transparent"
        onClick={() => {
          navigator.clipboard.writeText(shareLink);
          showNotification({
            title: "Copied!",
            message: "Favorites list URL has been copied to clipboard.",
            color: "green",
            icon: <IconCheck />,
            autoClose: 2000,
          });
        }}
      >
        <IconCopy style={{ width: rem(24), height: rem(24) }} />
      </ActionIcon>
    </Tooltip>
  );

  return (
    <>
      <Group justify="space-between">
        <h3>Your favorites:</h3>
        {copyUrlButton}
      </Group>
      <Carousel
        slideSize={{ base: "33.333%", sm: "20%" }}
        slideGap={{ base: "md", sm: "xl" }}
        align="start"
        controlSize={30}
      >
        {favoritesSlide}
      </Carousel>
    </>
  );
}
