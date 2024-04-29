import { createContext, useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import { getAllGroups, getGroupsByUserId } from "../data/groups";
import { getFavorites } from "../data/favorites";

export const UserInfoContext = createContext({});

export default function UserInfoProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [userGroupIds, setUserGroupIds] = useState([]);
  const { username, userId, isLoggedIn } = useAuth();

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) return;
      await getUsersGroups();
      await fetchFavorites();
    })();
  }, [isLoggedIn, userId]);

  useEffect(() => {
    (async () => {
      if (userGroupIds.length > 0) {
        await getGroups();
      } else {
        setUserGroups([]);
      }
    })();
  }, [userGroupIds]);

  const getGroups = async () => {
    try {
      const allGroups = await getAllGroups();
      const acceptedUserGroups = userGroupIds
        .filter((group) => group.accepted)
        .map((group) => group.group_id);
      const userMemberGroups = allGroups.filter((group) =>
        acceptedUserGroups.includes(group.group_id),
      );
      setUserGroups(userMemberGroups);
    } catch (error) {
      console.error(error);
    }
  };

  const getUsersGroups = async () => {
    if (!isLoggedIn) return;
    try {
      const usersGroups = await getGroupsByUserId(userId);
      setUserGroupIds(usersGroups);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavorites = async () => {
    if (isLoggedIn && username) {
      const favorites = await getFavorites(username).catch(console.error);
      setFavorites(favorites);
    }
  };

  return (
    <UserInfoContext.Provider
      value={{ favorites, setFavorites, userGroups, setUserGroups, userGroupIds, setUserGroupIds }}
    >
      {children}
    </UserInfoContext.Provider>
  );
}
