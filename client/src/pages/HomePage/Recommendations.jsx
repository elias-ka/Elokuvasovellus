import { MovieCard } from "../../components/MovieCard";
import { Title, useMantineTheme, Space, SegmentedControl, Group, Loader } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useEffect, useState } from "react";
import useUserInfo from "../../hooks/useUserInfo.js";
import useAuth from "../../hooks/useAuth";
import { getRecommended } from "../../data/media";

export default function Recommendations() {
  const { isLoggedIn } = useAuth();
  const { favorites } = useUserInfo();

  const [favMovies, setFavMovies] = useState([]);
  const [favTv, setFavTv] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recomMovies, setRecomMovies] = useState([]);
  const [recomTvShows, setRecomTvShows] = useState([]);
  const [mediaType, setMediaType] = useState("movie");

  useEffect(() => {
    filterFavorites();
  }, [favorites]);

  useEffect(() => {
    (async () => {
      await getAllRecommendations();
    })();
  }, [favMovies, favTv]);

  const filterFavorites = () => {
    if (!isLoggedIn || !favorites) {
      setFavMovies([]);
      setFavTv([]);
      return;
    }
    const onlyMovies = favorites.filter((favorite) => favorite.type === "movie");
    setFavMovies(onlyMovies);
    const onlyTvShows = favorites.filter((favorite) => favorite.type === "series");
    setFavTv(onlyTvShows);
  };

  const getRecommendations = async (mediaObject) => {
    if (!isLoggedIn || !favorites || !favorites.length || !mediaObject) return [];

    const type = mediaObject.type === "movie" ? "movie" : "tv";

    try {
      const media = await getRecommended(type, mediaObject.tmdb_id);
      const numFavorites = type === "movie" ? favMovies.length : favTv.length;
      let sliceIndex = 5;

      if (numFavorites > 6) {
        sliceIndex = 3;
      } else if (numFavorites <= 6) {
        sliceIndex = Math.ceil(15 / numFavorites);
      }
      return media.slice(0, sliceIndex).reverse();
    } catch (error) {
      console.error(error);
    }
  };

  const getAllRecommendations = async () => {
    if (!isLoggedIn || !favorites || !favorites.length) {
      setIsLoading(false);
      setRecomMovies([]);
      setRecomTvShows([]);
      return;
    }
    setIsLoading(true);
    const moviePromises = favMovies.map((movie) => getRecommendations(movie));
    const tvPromises = favTv.map((tv) => getRecommendations(tv));

    try {
      const moviesResults = await Promise.all(moviePromises);
      const tvResults = await Promise.all(tvPromises);

      const uniqueMovies = deduplicateAndFilter(moviesResults.flat(), favMovies);
      const uniqueTvShows = deduplicateAndFilter(tvResults.flat(), favTv);

      setRecomMovies(uniqueMovies.reverse());
      setRecomTvShows(uniqueTvShows.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deduplicateAndFilter = (items, favorites) => {
    const favoriteIds = new Set(favorites.map((fav) => fav.tmdb_id));
    const uniqueIds = new Set();
    const uniqueItems = [];

    items.forEach((item) => {
      if (!uniqueIds.has(item.id) && !favoriteIds.has(item.id)) {
        uniqueIds.add(item.id);
        uniqueItems.push(item);
      }
    });
    return uniqueItems;
  };

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const recomMovieSlides = recomMovies.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} />
    </Carousel.Slide>
  ));
  const recomTvSlides = recomTvShows.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} />
    </Carousel.Slide>
  ));

  return (
    <>
      <Group mt="xl" mb="lg">
        <Title order={2}>Recommended</Title>
        <SegmentedControl
          value={mediaType}
          onChange={setMediaType}
          data={[
            { label: "Movies", value: "movie" },
            { label: "TV shows", value: "tv" },
          ]}
          color="blue"
          size="md"
          radius="md"
          transitionDuration={300}
        />
      </Group>

      {isLoading && (
        <Group justify="center">
          <Loader></Loader>
        </Group>
      )}

      {!favorites && <Title order={3}>Add favorites to see recommendations</Title>}

      {!isLoading && favorites && (
        <Carousel
          slideSize={{ base: "33.333%", sm: "20%" }}
          slideGap={{ base: "md", lg: "xl" }}
          align="start"
          slidesToScroll={mobile ? 3 : 5}
          controlSize={30}
        >
          {mediaType === "movie" ? recomMovieSlides : recomTvSlides}
        </Carousel>
      )}
      <Space h="xl" />
    </>
  );
}
