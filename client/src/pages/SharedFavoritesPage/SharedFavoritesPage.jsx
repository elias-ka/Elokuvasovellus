import { useEffect, useState } from "react";
import { MovieCard } from "../../components/MovieCard/index.js";
import { useParams } from "react-router-dom";
import { Container, Grid } from "@mantine/core";
import { getFavoritesByListId } from "../../data/favorites.js";

export default function SharedFavoritesPage() {
  const { listId } = useParams();

  const [favorites, setFavorites] = useState(null);
  const [sharedBy, setSharedBy] = useState(null);

  useEffect(() => {
    (async () => {
      await fetchFavorites();
    })();
  }, []);

  const fetchFavorites = async () => {
    try {
      const result = await getFavoritesByListId(listId);
      // Muutetaan data ennen tilaan tallentamista
      // (MovieCard - komponentti odottaa "media_type", "poster_path" ja "id" - kenttiä)
      const modifiedMedia = result.map((media) => ({
        ...media,
        media_type: media.type,
        poster_path: media.poster_url,
        id: media.tmdb_id,
      }));
      setFavorites(modifiedMedia);
      setSharedBy(modifiedMedia[0].shared_by);
    } catch (error) {
      console.error(error);
    }
  };

  const favoritesGrid = favorites
    ? favorites.map((entry) => (
        <Grid.Col span={{ base: 4, md: 4, lg: 3 }} key={entry.id}>
          <MovieCard movie={entry} />
        </Grid.Col>
      ))
    : null;

  return (
    <Container size="lg">
      <h3>{sharedBy}'s favorites:</h3>
      <Grid mt="xl">{favoritesGrid}</Grid>
    </Container>
  );
}
