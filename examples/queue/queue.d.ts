import { Socket } from "zeromq";
export declare class Queue {
    queue: any[];
    socket: Socket;
    max: number;
    sending: boolean;
    constructor(socket: Socket, max?: number);
    send(msg: any): void;
    trySend(): Promise<void>;
}
