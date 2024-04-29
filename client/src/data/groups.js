import { api } from "./api";

export async function getAllGroups() {
  const { data } = await api.get("/groups");
  return data;
}

export async function getGroupsByUserId(userId) {
  const { data } = await api.get(`/groups/${userId}`);
  return data;
}

export async function sendRequest(groupId, userId) {
  const { data } = await api.post(`/groups/${groupId}/members`, {
    userId,
  });
  return data;
}

export async function cancelRequest(groupId, userId) {
  const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
  return data;
}

export async function acceptRequest(groupId, userId) {
  const { data } = await api.put(`/groups/${groupId}/members`, {
    userId,
  });
  return data;
}

export async function getGroupMembers(groupId) {
  const { data } = await api.get(`/groups/${groupId}/members`);
  return data;
}

export async function deleteGroupMember(groupId, userId) {
  const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
  return data;
}

export async function deleteGroupById(groupId) {
  const { data } = await api.delete(`/groups/${groupId}`);
  return data;
}
