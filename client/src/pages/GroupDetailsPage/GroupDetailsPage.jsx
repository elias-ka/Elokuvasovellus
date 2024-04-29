import { Container, Group, Space, Text, Title, Badge } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  acceptRequest,
  getGroupMembers,
  deleteGroupMember,
  deleteGroupById,
} from "../../data/groups";
import MemberList from "./GroupMembers.jsx";
import DeleteGroupModal from "./DeleteGroupModal.jsx";
import LeaveGroupModal from "./LeaveGroupModal.jsx";
import GroupMedia from "./GroupMedia.jsx";
import useAuth from "../../hooks/useAuth";
import useUserInfo from "../../hooks/useUserInfo.js";
import GroupShowtimes from "./GroupShowtimes.jsx";

export default function GroupDetailsPage() {
  const location = useLocation();
  const groupDetails = location.state?.groupDetails;
  const [groupMembers, setGroupMembers] = useState([]);
  const { userId, username } = useAuth();
  const acceptedMembers = groupMembers.filter((member) => member.accepted);
  const isOwner = groupDetails.owner_id === userId;
  const groupId = groupDetails.group_id;

  useEffect(() => {
    (async () => {
      await getMembers();
    })();
  }, []);

  const getMembers = async () => {
    try {
      const members = await getGroupMembers(groupId);
      setGroupMembers(members);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isOwner) return;
    try {
      await deleteGroupById(groupId);
    } catch (error) {
      console.error(error);
    }
  };

  async function handleMemberAction(userId, action) {
    const actionMap = {
      accept: async () => {
        await acceptRequest(groupId, userId);
      },
      reject: async () => {
        await deleteGroupMember(groupId, userId);
      },
      removeUser: async () => {
        await deleteGroupMember(groupId, userId);
      },
    };
    try {
      await actionMap[action]();
      getMembers();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Container size="xl" mb="xl" pt="xl" pb="xl" px={0}>
      <Container size="lg" mb="xl">
        <Group justify="flex-end" mb="xl">
          {isOwner ? (
            <DeleteGroupModal handleDeleteGroup={handleDeleteGroup} groupDetails={groupDetails} />
          ) : (
            <LeaveGroupModal
              handleMemberAction={handleMemberAction}
              username={username}
              user_id={userId}
              groupDetails={groupDetails}
            />
          )}
        </Group>
        <Group justify="space-between">
          <Title order={1}>{groupDetails.group_name}</Title>
          <Badge size="lg" variant="light" color="gray">
            MEMBERS: {acceptedMembers.length}
          </Badge>
        </Group>
        <Space h="xs" />

        <Text size="xl">{groupDetails.description}</Text>
      </Container>

      <Space h="xl" />

      <GroupMedia groupId={groupId} isOwner={isOwner} />

      <Container size="md" mb="xl">
        <Space h="xl" />
        <Title ta="center" order={3}>
          GROUP SHOWTIMES
          {GroupShowtimes()}
        </Title>
        <Space h="xl" />
      </Container>

      <MemberList
        groupMembers={groupMembers}
        isOwner={isOwner}
        handleMemberAction={handleMemberAction}
        ownerId={groupDetails.owner_id}
      />
    </Container>
  );
}
