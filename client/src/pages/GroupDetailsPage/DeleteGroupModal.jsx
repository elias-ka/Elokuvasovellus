import { Modal, Button, Text, Space } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DeleteGroupModal({ handleDeleteGroup, groupDetails }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [deleted, setDeleted] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    await handleDeleteGroup();
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
        Delete Group
      </Button>
      <Modal opened={opened} onClose={handleClose} title="Confirm Group Deletion." centered>
        {!deleted ? (
          <>
            <Text size="md">
              Are you sure you want to delete the group '{groupDetails.group_name}' and all its
              contents? This action cannot be undone.
            </Text>
            <Space h="xl" />
            <Button fullWidth color="red" onClick={handleDelete}>
              Delete group
            </Button>
          </>
        ) : (
          <>
            <Text size="md">Group '{groupDetails.group_name}' deleted!</Text>
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
