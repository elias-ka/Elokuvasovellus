import { Stack } from "@mantine/core";
import { GroupInfoCard } from "../GroupInfoCard";
import useUserInfo from "../../hooks/useUserInfo";

export default function UserGroups() {
  const { userGroups } = useUserInfo();

  return (
    <>
      <h3>Your groups:</h3>
      <Stack>
        {userGroups.map((group) => {
          return <GroupInfoCard group={group} key={group.group_id} showActionButton={false} />;
        })}
      </Stack>
    </>
  );
}
