export declare class Processor {
    threads: number;
    input: any;
    output: any;
    signal: any;
    init: Promise<any>;
    exit: Promise<any>;
    constructor(threads?: number);
    process(str: string): Promise<string>;
    stop(): Promise<void>;
}
