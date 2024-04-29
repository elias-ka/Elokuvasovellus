import { useEffect, useState } from "react";
import { Carousel } from "@mantine/carousel";
import { getGroupMedia, deleteGroupContentById } from "../../data/groupContent";
import { Container, useMantineTheme, Title, Space, Text } from "@mantine/core";
import { MovieCard } from "../../components/MovieCard";
import { useMediaQuery } from "@mantine/hooks";

export default function GroupMedia({ groupId, isOwner }) {
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [groupMovies, setGroupMovies] = useState([]);
  const [groupSeries, setGroupSeries] = useState([]);

  useEffect(() => {
    (async () => {
      await fetchMedia();
    })();
  }, []);

  const fetchMedia = async () => {
    try {
      const result = await getGroupMedia(groupId);
      // Muutetaan data ennen tilaan tallentamista
      const modifiedMedia = result.map((media) => ({
        ...media,
        media_type: media.type, // muutetaan "type" -> "media_type"
        poster_path: media.poster_url, // muutetaan "poster_url" -> "poster_path"
        id: media.tmdb_id, // muutetaan "tmdb_id" -> "id"
      }));
      // sarjat ja leffat erilleen
      setGroupMovies(modifiedMedia.filter((media) => media.media_type === "movie"));
      setGroupSeries(modifiedMedia.filter((media) => media.media_type === "series"));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGroupContentById(id);
    } catch (error) {
      console.error(error);
    }
    fetchMedia();
  };

  const movieSlides = groupMovies.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} isGroupOwner={isOwner} handleDelete={handleDelete} />
    </Carousel.Slide>
  ));

  const seriesSlides = groupSeries.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} isGroupOwner={isOwner} handleDelete={handleDelete} />
    </Carousel.Slide>
  ));

  return (
    <Container size="xl">
      <Title ta="center" order={3}>
        GROUP MOVIES
      </Title>

      {groupMovies.length > 0 ? (
        <Carousel
          slideSize={{ base: "33.333%", sm: "20%" }}
          slideGap={{ base: "md", lg: "xl" }}
          align="start"
          controlSize={30}
          loop={false}
          slidesToScroll={mobile ? 3 : 5}
          mt="sm"
          mb="xl"
        >
          {movieSlides}
        </Carousel>
      ) : (
        <Text ta="center">No movies added to the group</Text>
      )}
      <Space h="xl" />

      <Title ta="center" order={3}>
        GROUP SERIES
      </Title>
      {groupSeries.length > 0 ? (
        <Carousel
          slideSize={{ base: "33.333%", sm: "20%" }}
          slideGap={{ base: "md", lg: "xl" }}
          align="start"
          controlSize={30}
          loop={false}
          slidesToScroll={mobile ? 3 : 5}
          mt="sm"
        >
          {seriesSlides}
        </Carousel>
      ) : (
        <Text ta="center">No series added to the group</Text>
      )}
    </Container>
  );
}
