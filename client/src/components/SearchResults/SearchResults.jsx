import { MovieCard } from "../../components/MovieCard";
import { Container, Grid, Space } from "@mantine/core";

export default function SearchResults({ media }) {
  const mediaArray = media;
  return (
    <Container size="lg" p={0}>
      <Space h="xl" />
      <Grid mt="xl" gutter={{ base: "sm", sm: "md", md: "xl", lg: "xl", xl: "xl" }}>
        {mediaArray.map((mediaObj) => (
          <Grid.Col span={{ base: 4, md: 3, lg: 3 }} key={mediaObj.id}>
            <MovieCard movie={mediaObj} />
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  );
}
