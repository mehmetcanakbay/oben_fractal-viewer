export class Vertex {
    public x = 0;
    public y = 0;
    public z = 0;

    public u = 0;
    public v = 0;

    constructor(x = 0, y = 0, z= 0, u = 0, v = 0) {
        this.x = x
        this.y = y
        this.z = z

        this.u = u
        this.v = v
    }

    static convertVertexArrIntoBufferStyle(arr: Array<Vertex>) {
        const vertexArray = new Float32Array(arr.length * 5); 
        arr.forEach((vertex, index) => {
            const i = index * 5;

            vertexArray[i]     = vertex.x;
            vertexArray[i + 1] = vertex.y;
            vertexArray[i + 2] = vertex.z;
            vertexArray[i + 3] = vertex.u;
            vertexArray[i + 4] = vertex.v;
        });

        return vertexArray;
    }
}