import { Image, Text, ActionIcon } from "@mantine/core";
import classes from "./MovieCard.module.css";
import noimage from "../../assets/no-image.jpg";
import { useNavigate } from "react-router-dom";
import { IconTrash } from "@tabler/icons-react";
import useAuth from "../../hooks/useAuth";

export default function MovieCard({ movie, isGroupOwner = false, handleDelete }) {
  const navigate = useNavigate();
  const { username } = useAuth();
  const addedBy = movie.username; // this is used in group media to show who added the movie
  const canBeDeleted = isGroupOwner || username === addedBy;

  const handleClick = () => {
    navigate("/details", { state: { obj: movie } });
  };

  const baseURL = "https://image.tmdb.org/t/p/w500";

  return (
    <div className={classes.cardContainer}>
      <Image
        src={
          movie.media_type === "person" || movie.poster_path === null
            ? noimage
            : baseURL + movie.poster_path
        }
        className={classes.image}
      />

      <button className={classes.invisibleButton} onClick={handleClick}>
        <div className={classes.textOverlay}>
          <Text size="lg" c="white">
            {movie.title || movie.name}
          </Text>
          <Text mt="xs" c="white" size="sm">
            {new Date(movie.release_date ?? movie.first_air_date ?? "").getFullYear() || ""}
          </Text>
          {addedBy && (
            <>
              <Text mt="xl" c="white" size="sm">
                Added by:
              </Text>
              <Text c="white" size="sm">
                {addedBy === username ? "You" : addedBy}
              </Text>
            </>
          )}
        </div>
      </button>
      {canBeDeleted && (
        <ActionIcon
          color="red"
          className={classes.deleteButton}
          onClick={() => handleDelete(movie.content_id)}
        >
          <IconTrash />
        </ActionIcon>
      )}
    </div>
  );
}
