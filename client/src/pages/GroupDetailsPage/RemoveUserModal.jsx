import { Modal, Button, Text, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

export default function RemoveUserModal({ handleMemberAction, user_id, username }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    await handleMemberAction(user_id, "removeUser");
    setDeleted(true);
  };

  return (
    <>
      <Button size="xs" color="red" onClick={open}>
        Remove User
      </Button>
      <Modal opened={opened} onClose={close} title="Confirm User Removal." centered>
        {!deleted ? (
          <>
            <Text size="md">
              Are you sure you want to remove user '{username}' from the group? This action cannot
              be undone.
            </Text>
            <Space h="xl" />
            <Button fullWidth color="red" onClick={handleDelete}>
              Remove User
            </Button>
          </>
        ) : (
          <>
            <Text size="md">User '{username}' deleted!</Text>
            <Space h="xl" />
            <Button fullWidth onClick={close}>
              Close
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
