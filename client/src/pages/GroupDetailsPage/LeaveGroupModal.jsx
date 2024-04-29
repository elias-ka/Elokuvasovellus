import { Modal, Button, Text, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LeaveGroupModal({ handleMemberAction, user_id, groupDetails }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [deleted, setDeleted] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await handleMemberAction(user_id, "removeUser");
    setDeleted(true);
  };

  const handleClose = () => {
    if (deleted) {
      navigate("/groups");
    } else {
      close();
    }
  };

  return (
    <>
      <Button size="xs" color="red" onClick={open}>
        Leave Group
      </Button>
      <Modal opened={opened} onClose={handleClose} title="Confirm leaving group" centered>
        {!deleted ? (
          <>
            <Text size="md">
              Are you sure you want to leave the group '{groupDetails.group_name}'? This action
              cannot be undone.
            </Text>
            <Space h="xl" />
            <Button fullWidth color="red" onClick={handleDelete}>
              Leave Group
            </Button>
          </>
        ) : (
          <>
            <Text size="md">You left the group '{groupDetails.group_name}'!</Text>
            <Space h="xl" />
            <Button fullWidth onClick={() => navigate("/groups")}>
              Browse all groups
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
