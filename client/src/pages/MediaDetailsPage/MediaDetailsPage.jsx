import { useEffect, useMemo, useState } from "react";
import {
  rem,
  Container,
  AspectRatio,
  Modal,
  ActionIcon,
  Image,
  Group,
  Tooltip,
  Title,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Carousel } from "@mantine/carousel";
import { useLocation } from "react-router-dom";
import CastCarousel from "./CastCarousel.jsx";
import AddMediaToGroup from "./AddMediaToGroupButton.jsx";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo.js";
import { addFavorite, removeFavorite, getFavorites } from "../../data/favorites";
import { ReviewForm } from "../../components/ReviewForm";
import { IconHeart, IconPlus, IconStar } from "@tabler/icons-react";
import { getMovieDetails, getTvDetails, getImages } from "../../data/media";
import { submitReview, getReviews } from "../../data/reviews";
import { ReviewCard } from "../../components/ReviewCard";
import dayjs from "dayjs";
import { notifications } from "@mantine/notifications";

export default function MediaDetailsPage() {
  const { username, isLoggedIn, userId } = useAuth();
  const { favorites, setFavorites } = useUserInfo();
  const location = useLocation();
  const { obj: media } = location.state;
  const [details, setDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [inFavorites, setInFavorites] = useState(false);
  const [reviewOpened, { open: openReview, close: closeReview }] = useDisclosure(false);
  const [reviews, setReviews] = useState([]);
  const [images, setImages] = useState([]);
  const baseURL = "https://image.tmdb.org/t/p/w1280";

  useEffect(() => {
    (async () => {
      if (media.media_type === "movie") {
        const result = await getMovieDetails(media.id);
        setDetails(result);
      } else if (media.media_type === "tv" || media.media_type === "series") {
        const result = await getTvDetails(media.id);
        setDetails(result);
      }
      const reviews = await getReviews(media.id);
      setReviews(reviews);
      await fetchFavorites();
      setIsLoading(false);
    })();
  }, [media]);

  useEffect(() => {
    checkFavorites();
  }, [favorites]);

  const fetchFavorites = async () => {
    if (isLoggedIn && username) {
      try {
        const results = await getFavorites(username);
        setFavorites(results);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    try {
      await submitReview({
        tmdbId: media.id,
        title: media.title || media.name,
        type: media.title ? "movie" : "series",
        description: media.overview,
        posterUrl: media.poster_path,
        userId: userId,
        rating: e.rating,
        reviewText: e.review,
        released: media.release_date || media.first_air_date,
      });
      closeReview();
      notifications.show({
        title: "Review submitted",
        message: "Thank you for your review!",
        color: "green",
        autoClose: 3000,
      });
      setReviews(await getReviews(media.id));
    } catch (error) {
      console.error(error);
      notifications.show({
        title: "Review failed",
        message: "An error occurred while submitting your review.",
        color: "red",
        autoClose: 3000,
      });
    }
  };

  const checkFavorites = () => {
    if (isLoggedIn && favorites) {
      const idFound = favorites.some((favorite) => favorite.tmdb_id === media.id);
      setInFavorites(idFound);
    }
  };

  const addToFavorites = async () => {
    const type = media.title ? "movie" : "series";
    try {
      await addFavorite(
        username,
        media.title || media.name,
        type,
        media.overview,
        media.id,
        media.poster_path,
      );
      await fetchFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const removeFromFavorites = async () => {
    try {
      await removeFavorite(username, media.id);
      await fetchFavorites();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchImages = async () => {
    try {
      const results = await getImages(media.media_type, media.id);
      setImages(results);
    } catch (error) {
      console.error(error);
    }
  };

  const genresString = useMemo(() => {
    if (!details.genres) return null;
    return details.genres.map((genre) => genre.name).join(", ");
  }, [details.genres]);

  return (
    <Container py={16}>
      {images.length > 1 ? (
        <Carousel
          slideSize={{ base: "100%", sm: "100%" }}
          slideGap={{ base: "md", sm: "xl" }}
          align="start"
          slidesToScroll={1}
          controlSize={30}
          mb="lg"
        >
          {images.map((image) => (
            <Carousel.Slide key={image.file_path}>
              <AspectRatio ratio={16 / 9} m={0} p={0}>
                <Image src={baseURL + image.file_path} radius="lg"></Image>
              </AspectRatio>
            </Carousel.Slide>
          ))}
        </Carousel>
      ) : (
        <AspectRatio ratio={16 / 9} mb="lg" m={0} p={0}>
          <Image
            radius="lg"
            src={baseURL + details.backdrop_path}
            alt={media.title || media.name}
            style={{
              cursor: "pointer",
            }}
            onClick={fetchImages}
          />
        </AspectRatio>
      )}

      <Group justify="space-between">
        <Stack gap={0}>
          <Title order={2}>{media.title || media.name}</Title>
          <Group>
            <Text size="sm" c="dimmed">
              {dayjs(details.release_date || details.first_air_date).year()}
            </Text>
            <Text size="sm" c="dimmed">
              {genresString}
            </Text>
            {details.runtime ? (
              <Text size="sm" c="dimmed">
                {details.runtime || details.episode_run_time} min
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                {details.number_of_seasons === 1
                  ? "1 season"
                  : `${details.number_of_seasons} seasons`}
              </Text>
            )}
          </Group>
        </Stack>
        <Group>
          {isLoggedIn ? (
            <Tooltip label={`${inFavorites ? "Remove from" : "Add to"} favorites`}>
              <ActionIcon
                onClick={() => {
                  if (inFavorites) {
                    setInFavorites(false);
                    removeFromFavorites();
                  } else {
                    setInFavorites(true);
                    addToFavorites();
                  }
                }}
                color="red"
                size={42}
                variant="transparent"
              >
                <IconHeart
                  fill={inFavorites ? "red" : "transparent"}
                  style={{ width: rem(24), height: rem(24) }}
                />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Log in to add to favorites">
              <ActionIcon disabled color="red" size={42} variant="transparent">
                <IconHeart style={{ width: rem(24), height: rem(24) }} />
              </ActionIcon>
            </Tooltip>
          )}
          {isLoggedIn ? (
            <Tooltip label="Leave a review">
              <ActionIcon onClick={openReview} color="yellow" size={42} variant="transparent">
                <IconStar style={{ width: rem(24), height: rem(24) }} />
              </ActionIcon>
            </Tooltip>
          ) : (
            <Tooltip label="Log in to leave a review">
              <ActionIcon disabled color="yellow" size={42} variant="transparent">
                <IconStar style={{ width: rem(24), height: rem(24) }} />
              </ActionIcon>
            </Tooltip>
          )}
          {isLoggedIn ? (
            <AddMediaToGroup mediaObj={media} />
          ) : (
            <Tooltip label="Log in to add to a group">
              <ActionIcon disabled color="blue" size={42} variant="transparent">
                <IconPlus style={{ width: rem(24), height: rem(24) }} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Text>{details.overview}</Text>
      </Group>

      <Stack mt={16}>
        <Title order={3}>Cast</Title>
        {!isLoading && details.credits && <CastCarousel creditsArray={details.credits} />}
      </Stack>

      <Stack my={16}>
        <Title order={3}>User reviews</Title>
        {reviews.length === 0 && !isLoading ? (
          <Text>No reviews yet. Be the first to leave one!</Text>
        ) : (
          <Stack>
            {reviews.map((review) => (
              <ReviewCard key={review.review_id} review={review} disableViewMedia />
            ))}
          </Stack>
        )}
      </Stack>

      <Modal
        title={`Review ${media.title || media.name}`}
        size="lg"
        opened={reviewOpened}
        onClose={closeReview}
        lockScroll={false}
      >
        <ReviewForm onSubmit={handleReviewSubmit} />
      </Modal>
    </Container>
  );
}
