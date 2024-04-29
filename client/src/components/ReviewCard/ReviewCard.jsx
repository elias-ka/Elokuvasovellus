import { Button, Card, Group, Rating, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

export default function ReviewCard({ review, disableViewMedia }) {
  const navigate = useNavigate();

  const handleViewMedia = () => {
    navigate("/details", {
      state: {
        obj: {
          id: review.tmdb_id,
          media_type: review.type,
          ...review,
        },
      },
    });
  };

  return (
    <Card withBorder padding="md">
      <Group align="center" justify="space-between" spacing="md">
        <div>
          <Text size="lg" fw={600}>
            {review.title}
          </Text>
          <Group spacing="xs">
            <Text size="md">{review.username}</Text>
            <Text c="dimmed" size="sm">
              {dayjs(review.created_at).format("DD.MM.YYYY")}
            </Text>
          </Group>
        </div>
        <Rating value={review.rating} readOnly size="md" />
      </Group>
      <Text size="sm" mt="sm">
        {review.review_text}
      </Text>
      {!disableViewMedia && (
        <Button variant="subtle" onClick={handleViewMedia} fullWidth={false} mt="sm">
          View media
        </Button>
      )}
    </Card>
  );
}
