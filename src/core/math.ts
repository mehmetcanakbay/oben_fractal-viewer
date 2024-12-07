export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    // Normalize the vector
    normalize() {
        const length = Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
        if (length > 0) {
            return new Vector3(this.x / length, this.y / length, this.z / length);
        }
        return new Vector3();
    }

    // Subtract two vectors
    static subtract(a: Vector3, b: Vector3) {
        return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
    }

    // Cross product
    static cross(a : Vector3, b : Vector3) {
        return new Vector3(
            a.y * b.z - a.z * b.y,
            a.z * b.x - a.x * b.z,
            a.x * b.y - a.y * b.x
        );
    }
}

export function degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}