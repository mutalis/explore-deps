export interface Trap {
    error: Error;
    description: string;
    details?: string;
}

export function itsaTrap(t: Trap | string | object): t is Trap {
    const maybe = t as Trap;
    return !!maybe.error &&
        !!maybe.description;
}
