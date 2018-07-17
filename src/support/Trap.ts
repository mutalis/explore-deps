export interface Trap {
    error: Error;
    description: string;
    details?: string;
}

export function itsaTrap(t: any): t is Trap {
    const maybe = t as Trap;
    return maybe.error !== undefined &&
        maybe.description !== undefined;
}
