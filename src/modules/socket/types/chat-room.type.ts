export type ChatRoomType = {
    userRooms: Set<string>; // пользователи
    connections: Set<string>; // соединения, что прослушивают сообщения, но пока еще не вступили в чат
};
