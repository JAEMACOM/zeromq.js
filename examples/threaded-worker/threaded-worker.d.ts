export declare class ThreadedWorker {
    static spawn(threads: number): Promise<void>;
    input: any;
    output: any;
    signal: any;
    shift: number;
    maxDelay: number;
    constructor();
    stop(): Promise<void>;
    run(): Promise<void>;
    work(req: string): Promise<string>;
}
