import { MovieCard } from "../../components/MovieCard";
import {
  Container,
  Title,
  useMantineTheme,
  Space,
  rem,
  SegmentedControl,
  Group,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useEffect, useState } from "react";
import useUserInfo from "../../hooks/useUserInfo.js";
import useAuth from "../../hooks/useAuth";

export default function Recommendations() {
  const { isLoggedIn } = useAuth();
  const { favorites } = useUserInfo();

  const [favMovies, setFavMovies] = useState([]);
  const [favTv, setFavTv] = useState([]);

  const [recomMovies, setRecomMovies] = useState([]);
  const [recomTvShows, setRecomTvShows] = useState([]);
  const [mediaType, setMediaType] = useState("movie");

  useEffect(() => {
    filterFavorites();
  }, [favorites]);

  useEffect(() => {
    getAllRecommendations();
  }, [favMovies, favTv]);

  const filterFavorites = () => {
    const onlyMovies = favorites.filter((favorite) => favorite.type === "movie");
    setFavMovies(onlyMovies);

    const onlyTvShows = favorites.filter((favorite) => favorite.type === "series");
    setFavTv(onlyTvShows);
  };

  const getRecommendations = async (mediaObject) => {
    if (!isLoggedIn || !favorites.length || !mediaObject) return [];

    const type = mediaObject.type === "movie" ? "movie" : "tv";

    console.log("Fetching recommendations for:", mediaObject);

    const response = await fetch(
      `http://localhost:8000/search/recommendations?type=${type}&id=${mediaObject.tmdb_id}`,
    );
    const data = await response.json();

    if (type === "movie") {
      if (favMovies.length > 6) {
        return data.results.slice(0, 2);
      } else if (favMovies.length < 7) {
        const sliceIndex = Math.ceil(10 / favMovies.length)
        return data.results.slice(0, sliceIndex);
      }
    }
    if (type === "tv") {
      if (favTv.length > 6) {
        return data.results.slice(0, 2);
      } else if (favTv.length < 7) {
        const sliceIndex = Math.ceil(10 / favTv.length)
        return data.results.slice(0, sliceIndex);
      }
    }
    return data.results.slice(0, 5);
  };

  const getAllRecommendations = async () => {
    if (!isLoggedIn || !favorites.length) return;

    const moviePromises = favMovies.map((movie) => getRecommendations(movie));
    const tvPromises = favTv.map((tv) => getRecommendations(tv));

    const moviesResults = await Promise.all(moviePromises);
    const tvResults = await Promise.all(tvPromises);

    const uniqueMovies = deduplicate(moviesResults.flat());
    const uniqueTvShows = deduplicate(tvResults.flat());

    setRecomMovies(uniqueMovies);
    setRecomTvShows(uniqueTvShows);
  };

  const deduplicate = (items) => {
    const uniqueIds = new Set();
    const uniqueItems = [];

    items.forEach((item) => {
      if (!uniqueIds.has(item.id)) {
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
      {console.log("Fav movies:")}
      {console.log(favMovies)}

      {console.log("Recommended movies:")}
      {console.log(recomMovies)}

      {console.log("Fav tv:")}
      {console.log(favTv)}

      {console.log("Recommended tv:")}
      {console.log(recomTvShows)}

      <Carousel
        slideSize={{ base: "33.333%", sm: "20%" }}
        slideGap={{ base: "md", sm: "xl" }}
        align="start"
        slidesToScroll={mobile ? 3 : 5}
        controlSize={30}
      >
        {mediaType === "movie" ? recomMovieSlides : recomTvSlides}
      </Carousel>
      <Space h="xl" />
    </>
  );
}