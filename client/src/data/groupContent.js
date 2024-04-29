import { api } from "./api";

export async function getGroupContents(groupId) {
  const { data } = await api.get(`/groups/${groupId}/contents`);
  return data;
}

export async function getGroupShowtime(groupId) {
  const { data } = await api.get(`/groups/${groupId}/contents/showtime`);
  return data;
}

export async function addMediaToGroup(
  groupId,
  userId,
  title,
  type,
  description,
  tmdbId,
  posterUrl,
) {
  const { data } = await api.post(`/groups/${groupId}/contents/media`, {
    addedBy: userId,
    title,
    type,
    description,
    tmdbId,
    posterUrl,
  });
  return data;
}

export async function addShowtimeToGroup(groupId, userId, ID, showtime) {
  const { data } = await api.post(`/groups/${groupId}/contents/showtime`, {
    addedBy: userId,
    ID,
    showtimeObjectRaw: showtime,
  });
  return data;
}

export async function deleteGroupContentById(contentId) {
  const { data } = await api.delete(`/groups/contents/${contentId}`);
  return data;
}

export async function deleteAllGroupContent(groupId) {
  await api.delete(`/groups/${groupId}/contents`);
}

export async function getGroupMedia(groupId) {
  const { data } = await api.get(`/groups/${groupId}/contents/media`);
  return data;
}

export async function getMovieDetails(id) {
  const { data } = await api.get(`/search/movie/details/${id}/`);
  return { data };
}

export async function getSeriesDetails(id) {
  const { data } = await api.get(`/search/tv/details/${id}/`);
  return { data };
}
