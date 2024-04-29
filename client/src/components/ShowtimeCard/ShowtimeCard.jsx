import {
  Card,
  Image,
  Text,
  Group,
  Stack,
  Divider,
  Anchor,
  Tooltip,
  Button,
  Menu,
} from "@mantine/core";
import dayjs from "dayjs";
import { addShowtimeToGroup, getGroupShowtime } from "../../data/groupContent";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo";
import { basicNotification } from "../Notifications";
import { useLocation } from "react-router-dom";

export default function ShowtimeCard({ showtime }) {
  const showStartTime = dayjs(showtime.dttmShowStart).format("HH.mm");
  const showEndTime = dayjs(showtime.dttmShowEnd).format("HH.mm");
  const { userGroups } = useUserInfo();
  const { userId } = useAuth();
  const messageUser = basicNotification();
  const location = useLocation();
  const excludePathForButton = "/group-details";

  async function handleAddShowtime(groupId) {
    const groupContents = await getGroupShowtime(groupId);

    const alreadyInGroupContents = groupContents.some((entry) => entry.showtime_id === showtime.ID);

    if (!alreadyInGroupContents) {
      try {
        await addShowtimeToGroup(groupId, userId, showtime.ID, showtime);
        messageUser("Yaay!", "Showtime added to your group!", "green");
      } catch (error) {
        console.error(error);
      }
    } else {
      messageUser("Oopsies..", "This showtime is already in your group..", "red");
    }
  }

  function ContentDescriptorImages() {
    const contentDescriptors = showtime.ContentDescriptors.ContentDescriptor;

    if (!Array.isArray(contentDescriptors)) {
      return null;
    }

    return contentDescriptors.map((descriptor, index) => {
      // Insert a space before capital letters, e.g. "ViolenceAndGore" -> "Violence And Gore"
      const label = descriptor.Name.replace(/([A-Z])/g, " $1").trim();
      return (
        <Tooltip key={index} label={label} position="top">
          <Image src={descriptor.ImageURL} alt={label} width={26} height={26} />
        </Tooltip>
      );
    });
  }

  function AddShowtimeButton(props) {
    return (
      <Menu shadow="md" {...props}>
        <Menu.Target>
          <Button fz="md" variant="transparent" p={0}>
            Add to group
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          {userGroups.map((group) => (
            <Menu.Item key={group.group_id} onClick={() => handleAddShowtime(group.group_id)}>
              <Text>{group.group_name}</Text>
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Card withBorder radius="md" padding="sm" style={{ width: "100%" }}>
      <Group wrap="nowrap">
        <Stack gap={0} align="center" p="sm">
          <Text fz="h2" fw="bold">
            {showStartTime}
          </Text>
          <Text c="dimmed">{showEndTime}</Text>
        </Stack>
        <Divider orientation="vertical" size="sm" />
        <Stack pl="sm" gap={0}>
          <Anchor fz={{ base: "h3", sm: "h2" }} fw="bold" href={showtime.EventURL} target="_blank">
            {showtime.OriginalTitle}
          </Anchor>
          <Text c="dimmed" fz="lg">
            {showtime.TheatreAndAuditorium}
          </Text>

          <Group pt="sm">
            <Image src={showtime.RatingImageUrl} alt={showtime.Rating} width={26} height={26} />
            <ContentDescriptorImages />
          </Group>
          <Group mt="sm">
            <Anchor fw={700} href={showtime.ShowURL} target="_blank">
              Buy tickets
            </Anchor>
            {userId !== null && location.pathname !== excludePathForButton && <AddShowtimeButton />}
          </Group>
        </Stack>
      </Group>
    </Card>
  );
}
