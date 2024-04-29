import { Button, TextInput, Group } from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import React from "react";

export default function CreateGroupForm({ onSubmit }) {
  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      groupName: "",
      groupDescription: "",
    },
    validate: {
      groupName: isNotEmpty("Group Name is required"),
      groupDescription: isNotEmpty("Group Description is required"),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <TextInput
        label="Group name"
        placeholder="Group name"
        required
        {...form.getInputProps("groupName")}
      />
      <TextInput
        label="Group description"
        placeholder="Group description"
        required
        mt="md"
        mb="xl"
        {...form.getInputProps("groupDescription")}
      />
      <Group justify="space-evenly">
        <Button type="submit" mr="xl" style={{ flex: 1 }}>
          Create Group
        </Button>
        <Button style={{ flex: 1 }}>Cancel</Button>
      </Group>
    </form>
  );
}
