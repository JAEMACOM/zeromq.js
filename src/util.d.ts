type SocketMethods = "send" | "receive" | "join" | "leave";
/**
 * This function is used to remove the given methods from the given socket_prototype
 * to make the relevant socket types have only their relevant methods.
 * @param socketPrototype
 * @param methods
 */
export declare function allowMethods(socketPrototype: any, methods: SocketMethods[]): void;
export {};
