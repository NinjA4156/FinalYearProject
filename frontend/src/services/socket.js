import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

let socketInstance = null;

export const getSocket = () => {
    if (!socketInstance) {
        socketInstance = io(SOCKET_URL, {
            autoConnect: true,
            transports: ["websocket", "polling"],
        });
    }
    return socketInstance;
};

export const connectSocket = (onMessage) => {
    const socket = getSocket();

    if (!socket.connected) {
        socket.connect();
    }

    const handleMessage = (data) => {
        if (typeof onMessage === "function") {
            onMessage(data);
        }
    };

    // Listen to token updates and standard backend events
    socket.on("token_updated", handleMessage);
    socket.on("TOKEN_CREATED", handleMessage);
    socket.on("TOKEN_CALLED", handleMessage);
    socket.on("TOKEN_COMPLETED", handleMessage);
    socket.on("receive_message", handleMessage);

    return {
        socket,
        close: () => {
            socket.off("token_updated", handleMessage);
            socket.off("TOKEN_CREATED", handleMessage);
            socket.off("TOKEN_CALLED", handleMessage);
            socket.off("TOKEN_COMPLETED", handleMessage);
            socket.off("receive_message", handleMessage);
        },
        disconnect: () => {
            socket.off("token_updated", handleMessage);
            socket.off("TOKEN_CREATED", handleMessage);
            socket.off("TOKEN_CALLED", handleMessage);
            socket.off("TOKEN_COMPLETED", handleMessage);
            socket.off("receive_message", handleMessage);
            socket.disconnect();
        },
    };
};

export const disconnectSocket = () => {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
};

export default getSocket;
