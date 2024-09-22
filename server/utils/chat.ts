export function getRoomUser(ctx: any, name: string) {
  const cookie = getCookie(ctx, name) || '{"user": null, "room": null}'

  const { user, room } = JSON.parse(cookie)

  if (!user || !room) {
    throw createError({
      statusMessage: "User or Room not valid",
      statusCode: 400
    });
  }

  return { user, room }
}