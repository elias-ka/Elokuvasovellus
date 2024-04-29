import { MovieCard } from "../../components/MovieCard";
import { Title, useMantineTheme, Space, SegmentedControl, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useEffect, useState } from "react";
import { getTrending } from "../../data/media";

export default function Trending() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTVShows, setTrendingTVShows] = useState([]);
  const [mediaType, setMediaType] = useState("movie");

  useEffect(() => {
    (async () => {
      await getTrendingMedia();
    })();
  }, []);

  const getTrendingMedia = async () => {
    try {
      const movies = await getTrending("movies");
      setTrendingMovies(movies);
      const tv = await getTrending("tv");
      setTrendingTVShows(tv);
    } catch (error) {
      console.error(error);
    }
  };

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const movieSlides = trendingMovies.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} />
    </Carousel.Slide>
  ));
  const TVSlides = trendingTVShows.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} />
    </Carousel.Slide>
  ));

  return (
    <>
      <Group mt="xl" mb="lg">
        <Title order={2}>Trending</Title>
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
      <Carousel
        slideSize={{ base: "33.333%", sm: "20%" }}
        slideGap={{ base: "md", lg: "xl" }}
        align="start"
        slidesToScroll={mobile ? 3 : 5}
        controlSize={30}
      >
        {mediaType === "movie" ? movieSlides : TVSlides}
      </Carousel>
      <Space h="xl" />
    </>
  );
}
