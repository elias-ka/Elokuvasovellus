import { useEffect, useState } from "react";
import { Container, Button, Group, Stack, Skeleton } from "@mantine/core";
import { GroupInfoCard } from "../../components/GroupInfoCard";
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo";
import { sendRequest, cancelRequest, getAllGroups, getGroupsByUserId } from "../../data/groups";

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const { userGroupIds, setUserGroupIds } = useUserInfo();
  const [searchText, setSearchText] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const { userId, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      await getGroups();
      await getUsersGroups();
      setLoading(false);
    })();
  }, [updateTrigger, isLoggedIn, userId]);

  const getGroups = async () => {
    try {
      const groups = await getAllGroups();
      const sortedGroups = groups.sort((a, b) => a.group_name.localeCompare(b.group_name));
      setGroups(sortedGroups);
    } catch (error) {
      console.error(error);
    }
  };

  const getUsersGroups = async () => {
    if (!isLoggedIn) return;
    try {
      const usersGroups = await getGroupsByUserId(userId);
      setUserGroupIds(usersGroups);
    } catch (error) {
      console.error(error);
    }
  };

  // Tarkistaa käyttäjän jäsenyyden ja jäsenyyden tilan tietyssä ryhmässä.
  const checkMembershipStatus = (groupId) => {
    const membership = userGroupIds.find((group) => group.group_id === groupId);
    if (membership) {
      return {
        isMember: true,
        isPending: !membership.accepted,
      };
    } else {
      return {
        isMember: false,
        isPending: false,
      };
    }
  };

  const handleMembershipRequest = async (groupId, action) => {
    try {
      if (action === "send") {
        await sendRequest(groupId, userId);
      } else if (action === "cancel") {
        await cancelRequest(groupId, userId);
      }
      setUpdateTrigger((prev) => prev + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchSubmitted(true);
  };

  const createGroupButtonHandler = () => {
    if (isLoggedIn) {
      navigate("/create-group");
    } else {
      navigate("/login");
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.group_name.toLowerCase().includes(searchText.toLowerCase()) ||
      group.description.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <Container size="xl" mt="lg" mb="xl">
      <Container size="sm" mt="lg" mb="xl">
        <Group justify="flex-end" gutter="lg">
          <form onSubmit={handleSubmit} style={{ flexGrow: 0.8 }}>
            <SearchBar
              placeholder="Search groups"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSearchSubmitted(false);
              }}
            />
          </form>
          <Button onClick={createGroupButtonHandler}>Create Group</Button>
        </Group>
      </Container>
      {searchSubmitted && searchText && <h3>Search results for: "{searchText}"</h3>}
      <Container size="md" mt="lg">
        <Stack spacing="lg" mt="lg">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height={185} />)
            : filteredGroups.map((group) => (
                <GroupInfoCard
                  group={group}
                  key={`${group.group_id}-${checkMembershipStatus(group.group_id).isPending}`}
                  membershipStatus={checkMembershipStatus(group.group_id)}
                  onMembershipRequest={handleMembershipRequest}
                />
              ))}
        </Stack>
      </Container>
    </Container>
  );
}
