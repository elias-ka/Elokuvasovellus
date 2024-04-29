import { SearchResults } from "../../components/SearchResults";
import { Container, SegmentedControl, useMantineTheme, Group, Select, Button } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { searchWithFilters, getGenres, getProviders, searchPeople } from "../../data/media";

export default function AdvancedSearchPage() {
  const [media, setMedia] = useState([]);
  const [mediaType, setMediaType] = useState("movie");
  const [genres, setGenres] = useState([]);
  const [genreID, setGenreID] = useState();
  const [providers, setProviders] = useState([]);
  const [providerID, setProviderID] = useState();
  const [actors, setActors] = useState([]);
  const [actorID, setActorID] = useState();
  const [directors, setDirectors] = useState([]);
  const [directorID, setDirectorID] = useState();
  const [tvType, setTvType] = useState();
  const [tvStatus, setTvStatus] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      await getGenresAndProviders();
    })();
  }, [mediaType]);

  useEffect(() => {
    (async () => {
      await searchMedia(true);
    })();
  }, []);

  const getGenresAndProviders = async () => {
    try {
      const genreResults = await getGenres(mediaType);
      setGenres(genreResults);
      const providerResults = await getProviders(mediaType);
      setProviders(providerResults);
    } catch (error) {
      console.error(error);
    }
  };

  const searchActors = async (query) => {
    if (!query) {
      setActors([]);
      return;
    }
    try {
      const searchResults = await searchPeople(query);
      setActors(() =>
        searchResults.filter(
          (person) => person.name.includes(" ") && person.known_for_department === "Acting",
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const searchDirectors = async (query) => {
    if (!query) {
      setDirectors([]);
      return;
    }
    try {
      const searchResults = await searchPeople(query);
      setDirectors(() =>
        searchResults.filter(
          (person) => person.name.includes(" ") && person.known_for_department === "Directing",
        ),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const searchMedia = async (reset) => {
    const fetchMedia = async (page) => {
      const searchResultsRaw = await searchWithFilters(
        mediaType,
        page,
        genreID,
        providerID,
        actorID,
        directorID,
        tvType,
        tvStatus,
      );

      const searchResults = searchResultsRaw.results.map((item) => ({
        ...item,
        media_type: mediaType,
      }));

      return searchResults;
    };

    try {
      if (reset) {
        const firstPageResults = await fetchMedia(1);
        setMedia(firstPageResults);
        setCurrentPage(1);
        setHasMore(true);
      } else {
        const newPage = currentPage + 1;
        const newMediaResults = await fetchMedia(newPage);
        setMedia((prevMedia) => {
          const existingIds = new Set(prevMedia.map((item) => item.id));
          const filteredNewMedia = newMediaResults.filter((item) => !existingIds.has(item.id));
          return [...prevMedia, ...filteredNewMedia];
        });

        setHasMore(newMediaResults.length > 0);
        setCurrentPage(newPage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const genreOptions = genres.map((genre) => ({
    value: genre.id.toString(),
    label: genre.name,
  }));

  const providerOptions = providers.map((provider) => ({
    value: provider.provider_id.toString(),
    label: provider.provider_name,
  }));

  const actorOptions = actors.map((actor) => ({
    value: actor.id.toString(),
    label: actor.name,
  }));

  const directorOptions = directors.map((person) => ({
    value: person.id.toString(),
    label: person.name,
  }));

  const tvTypeOptions = [
    { value: "0", label: "Documentary" },
    { value: "1", label: "News" },
    { value: "2", label: "Miniseries" },
    { value: "3", label: "Reality" },
    { value: "4", label: "Scripted" },
    { value: "5", label: "Talk Show" },
    { value: "6", label: "Video" },
  ];

  const tvStatusOptions = [
    { value: "0", label: "Returning" },
    { value: "1", label: "Planned" },
    { value: "2", label: "In Production" },
    { value: "3", label: "Ended" },
    { value: "4", label: "Cancelled" },
    { value: "5", label: "Pilot" },
  ];

  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  return (
    <Container size="xl" mt="lg" px={mobile ? "xs" : "lg"}>
      <Container size="lg">
        <Group justify="start">
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
        <Group justify="start" mt="lg">
          <Select
            label="Genre"
            placeholder="All"
            data={genreOptions}
            onChange={(value) => setGenreID(Number(value))}
            searchable
            clearable
            checkIconPosition="right"
            size="md"
            radius="md"
          />
          <Select
            label="Streaming on"
            placeholder="All"
            data={providerOptions}
            onChange={(value) => setProviderID(Number(value))}
            searchable
            clearable
            checkIconPosition="right"
            size="md"
            radius="md"
          />
          {mediaType === "movie" ? (
            <Select
              label="Actor"
              placeholder="All"
              data={actorOptions}
              onChange={(value) => setActorID(Number(value))}
              onSearchChange={searchActors}
              searchable
              clearable
              checkIconPosition="right"
              size="md"
              radius="md"
            />
          ) : (
            <Select
              label="Type"
              placeholder="All"
              data={tvTypeOptions}
              onChange={(value) => setTvType(value)}
              searchable
              clearable
              checkIconPosition="right"
              size="md"
              radius="md"
            />
          )}
          {mediaType === "movie" ? (
            <Select
              label="Director"
              placeholder="All"
              data={directorOptions}
              onChange={(value) => setDirectorID(Number(value))}
              onSearchChange={searchDirectors}
              searchable
              clearable
              checkIconPosition="right"
              size="md"
              radius="md"
            />
          ) : (
            <Select
              label="Status"
              placeholder="All"
              data={tvStatusOptions}
              onChange={(value) => setTvStatus(value)}
              searchable
              clearable
              checkIconPosition="right"
              size="md"
              radius="md"
            />
          )}
        </Group>
        <Button
          onClick={() => {
            searchMedia(true);
          }}
          mt="lg"
          radius="md"
          rightSection={<IconArrowRight size={16} />}
        >
          Search
        </Button>
      </Container>
      <SearchResults media={media} />
      <Container mb="lg" mt="lg" px="xl">
        {hasMore && (
          <Button
            onClick={() => {
              searchMedia(false);
            }}
            mt="lg"
            mb="lg"
            radius="md"
            fullWidth
          >
            Load More
          </Button>
        )}
      </Container>
    </Container>
  );
}
