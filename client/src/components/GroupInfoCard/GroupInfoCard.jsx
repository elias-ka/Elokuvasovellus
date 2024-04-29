import React, { useState } from "react";
import { Card, Title, Text, Badge, Container, Group } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import GroupCardActionButton from "./GroupCardActionButton.jsx";
import useAuth from "../../hooks/useAuth";

export default function GroupCard({
  group,
  membershipStatus = { isMember: true, isPending: false },
  onMembershipRequest = () => {},
  showActionButton = true, // Liittymisnappi/jäsenyyden status näytetään oletuksena, mutta voidaan piilottaa
}) {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { isMember, isPending } = membershipStatus;
  const isOwner = group.owner_id === userId;

  const handleTitleClick = () => {
    if (isMember && !isPending) {
      navigate("/group-details", { state: { groupDetails: group } });
    }
  };

  return (
    <Card pl="xl" shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Title
          order={2}
          onClick={handleTitleClick}
          style={{ cursor: isMember && !isPending ? "pointer" : "default" }}
        >
          {group.group_name}
        </Title>
        <Badge variant="light" color="gray">
          Members: {group.member_count}
        </Badge>
      </Group>

      <Text size="md" c="dimmed">
        {group.description}
      </Text>
      {showActionButton && membershipStatus && onMembershipRequest && (
        <Container size="md" mt="md">
          <GroupCardActionButton
            isOwner={isOwner}
            isMember={isMember}
            isPending={isPending}
            groupId={group.group_id}
            onMembershipRequest={onMembershipRequest}
          />
        </Container>
      )}
    </Card>
  );
}
