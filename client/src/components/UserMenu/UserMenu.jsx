import classes from "./UserMenu.module.css";
import { Menu, Group, Text, UnstyledButton } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconUser, IconLogout, IconCaretDownFilled } from "@tabler/icons-react";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function UserMenu({ onLogout }) {
  const navigate = useNavigate();
  const { username } = useAuth();
  const [opened, { toggle, onOpen, onClose, close }] = useDisclosure(false);

  return (
    <Group>
      <Menu
        width={220}
        shadow="md"
        position="bottom-end"
        opened={opened}
        onClose={onClose}
        onOpen={onOpen}
      >
        <Menu.Target>
          <UnstyledButton onClick={toggle} className={classes.menuButton}>
            <Group>
              <Text size="sm">{username}</Text>
              <IconCaretDownFilled
                className={`${classes.menuButtonIcon} ${opened ? classes.flipped : ""}`}
                size={18}
              />
            </Group>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            onClick={() => {
              close();
              navigate("/profile");
            }}
            leftSection={<IconUser className={classes.menuItemIcon} />}
          >
            Profile
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            leftSection={<IconLogout className={classes.menuItemIcon} />}
            onClick={onLogout}
          >
            Log Out
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
