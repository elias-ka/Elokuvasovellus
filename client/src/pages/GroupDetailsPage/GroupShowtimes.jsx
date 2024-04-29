import { Stack, Text } from "@mantine/core";
import { ShowtimeCard } from "../../components/ShowtimeCard";
import { getGroupShowtime } from "../../data/groupContent";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function GroupShowtimes() {
  const location = useLocation();
  const groupDetails = location.state?.groupDetails;
  const groupId = groupDetails.group_id;
  const [groupShowtimeList, setGroupShowtimeList] = useState([]);

  useEffect(() => {
    async function getShowtimeIds() {
      const groupShowtimes = await getGroupShowtime(groupId);
      setGroupShowtimeList(groupShowtimes);
    }
    getShowtimeIds();
  }, []);

  return (
    <>
      <Stack gap="sm">
        {groupShowtimeList.length > 0 ? (
          groupShowtimeList.map((showtime) => (
            <ShowtimeCard key={showtime.showtime_id} showtime={showtime.showtime_obj} />
          ))
        ) : (
          <Text>No showtimes added to the group</Text>
        )}
      </Stack>
    </>
  );
}
