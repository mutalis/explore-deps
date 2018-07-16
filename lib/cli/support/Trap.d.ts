export interface Trap {
    error: Error;
    description: string;
    details?: string;
}
export declare function itsaTrap(t: any): t is Trap;
