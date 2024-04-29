import {
  Stack,
  Button,
  Group,
  Text,
  Title,
  Paper,
  Container,
  Divider,
  Center,
  Space,
} from "@mantine/core";
import RemoveUserModal from "./RemoveUserModal.jsx";

export default function MemberList({ groupMembers, isOwner, ownerId, handleMemberAction }) {
  const pendingMembers = groupMembers.filter((member) => !member.accepted);
  const acceptedMembers = groupMembers
    .filter((member) => member.accepted)
    .sort((a, b) => (b.user_id === ownerId ? 1 : -1)); // järjestää listan niin että omistaja on aina listan ensimmäisenä

  return (
    <Container size="sm">
      <Paper withBorder shadow="md" p="sm" radius="xs">
        <Center>
          <Title order={4}>Group Members</Title>
        </Center>
        <Stack gap="0">
          {acceptedMembers.map((member) => (
            <div key={member.user_id}>
              <Divider my="sm" variant="dashed" />
              <Group justify="space-between">
                <Text>{member.username}</Text>
                {member.user_id === ownerId ? (
                  <Text>Group Owner</Text>
                ) : (
                  isOwner && (
                    <RemoveUserModal
                      handleMemberAction={handleMemberAction}
                      user_id={member.user_id}
                      username={member.username}
                    />
                  )
                )}
              </Group>
            </div>
          ))}
        </Stack>
      </Paper>
      <Space h="xl" />
      {isOwner && pendingMembers.length > 0 && (
        <Paper withBorder shadow="md" p="sm" radius="xs" mt="xl">
          <Center>
            <Title order={4}>Pending requests:</Title>
          </Center>
          <Stack gap="0">
            {pendingMembers.map((member) => (
              <div key={member.user_id}>
                <Divider my="sm" variant="dashed" />
                <Group justify="space-between">
                  <Text>{member.username}</Text>
                  <Group>
                    <Button onClick={() => handleMemberAction(member.user_id, "accept")}>
                      Accept
                    </Button>
                    <Button
                      color="red"
                      onClick={() => handleMemberAction(member.user_id, "reject")}
                    >
                      Decline
                    </Button>
                  </Group>
                </Group>
              </div>
            ))}
          </Stack>
        </Paper>
      )}
    </Container>
  );
}
