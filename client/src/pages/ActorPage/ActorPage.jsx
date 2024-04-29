import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Image,
  Text,
  Group,
  Flex,
  Title,
  useMantineTheme,
  ActionIcon,
  ScrollArea,
  Loader,
} from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Carousel } from "@mantine/carousel";
import { MovieCard } from "../../components/MovieCard";
import { useMediaQuery } from "@mantine/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import { getActorDetails } from "../../data/media";

export default function ActorPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const actorId = location.state.id;
  const [actorInfo, setActorInfo] = useState([]);
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await getInfo();
    })();
  }, []);

  const getInfo = async () => {
    setIsLoading(true);
    try {
      const searchResults = await getActorDetails(actorId);
      setActorInfo(searchResults);

      const uniqueMovies = deduplicate(searchResults.combined_credits.cast.slice(0, 30));
      setMovies(uniqueMovies);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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

  const baseURL = "https://image.tmdb.org/t/p/w300";

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const movieSlides = movies.map((item) => (
    <Carousel.Slide key={item.id}>
      <MovieCard movie={item} />
    </Carousel.Slide>
  ));

  return (
    <Container size="lg" mt="lg">
      <Group justify="space-between">
        <ActionIcon variant="outline" onClick={() => navigate(-1)}>
          <IconArrowLeft></IconArrowLeft>
        </ActionIcon>
      </Group>
      <Card shadow="lg" padding="lg" radius="md" withBorder>
        <Title ta="center" order={2}>
          {actorInfo.name}
        </Title>
        <Flex gap="lg" direction={mobile ? "column" : "row"}>
          <Container>
            <Image
              src={baseURL + actorInfo.profile_path}
              radius="md"
              w={mobile ? 250 : "auto"}
              mt="lg"
            ></Image>
          </Container>
          <Container mt="lg">
            <Title order={4}>{actorInfo.place_of_birth}</Title>
            <Title order={5}>{actorInfo.birthday}</Title>
            <ScrollArea mt="lg" h={300} type="auto" offsetScrollbars>
              <Text>{actorInfo.biography}</Text>
            </ScrollArea>
          </Container>
        </Flex>
        <Title ta="center" c="blue" mt="md" order={2}>
          Known for
        </Title>
        {isLoading ? (
          <Group justify="center">
            <Loader></Loader>
          </Group>
        ) : (
          <Carousel
            mt="md"
            slideSize={{ base: "33.333%", sm: "20%" }}
            slideGap={{ base: "md", sm: "xl" }}
            align="start"
            slidesToScroll={mobile ? 3 : 5}
            controlSize={30}
          >
            {movieSlides}
          </Carousel>
        )}
      </Card>
    </Container>
  );
}
