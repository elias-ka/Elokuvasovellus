import { Container, TextInput, Button, Space, Checkbox } from "@mantine/core";
import useAuth from "../../hooks/useAuth";
import { useForm } from "@mantine/form";
import { logout } from "../../data/auth";
import { useNavigate } from "react-router-dom";
import { basicNotification } from "../Notifications";
import { api } from "../../data/api";

export default function DeleteAccount() {
  const { username, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    initialValues: { password: "", boxChecked: false },
  });

  const customNotification = basicNotification();

  const handleSubmit = async (values) => {
    if (!values.boxChecked) {
      customNotification("Error", "Please mark the checkbox to confirm deletion", "red");
      return;
    }

    try {
      await api.delete("/users", {
        data: {
          password: values.password,
        },
      });
      customNotification("Ok", "Account permanently deleted", "green");
      logout();
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      customNotification("Error", "Password incorrect!", "red");
      return;
    }
    form.reset();
  };

  return (
    <Container>
      <h1>{username}</h1>

      <Container size="xs">
        By deleting your account you will lose all of your data permanently. This action can not be
        undone.
        <Space h="md" />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Password"
            placeholder="Enter your password"
            {...form.getInputProps("password")}
            type="password"
          />
          <Checkbox
            mt="md"
            label="Yes, I understand the consequences and want to delete my account"
            {...form.getInputProps("boxChecked", { type: "checkbox" })}
          />
          <Space h="md" />
          <Button type="submit" variant="filled" color="red" size="md" radius="md">
            DELETE USER ACCOUNT
          </Button>
        </form>
      </Container>
    </Container>
  );
}
