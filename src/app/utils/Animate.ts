export function easeInSine(x: number): number {
    return 1 - Math.cos((x * Math.PI) / 2);
}

export function easeOutSine(x: number): number {
    return Math.sin((x * Math.PI) / 2);
}

export function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeInSine_REVERSE(y: number): number {
    return 2 * Math.acos(1 - y) / Math.PI;
}

export function easeOutSine_REVERSE(y: number): number {
    return 2 * Math.asin(y) / Math.PI;
}

export function easeInOutSine_REVERSE(y: number): number {
    return Math.acos(-2 * y + 1) / Math.PI;
}