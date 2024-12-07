import { Vertex } from "../vertex";

export const quadVertexCount = 6;
export const quadVertexSize = 4 * 5; //byte
export const quadPositionOffset = 0;
export const quadUVOffset = 4 * 3;

//x, y, z, u, v
const vertices = [ 
    new Vertex(-1.0, -1.0, 0, 0, 0),
    new Vertex( 1.0, -1.0, 0, 1, 0),
    new Vertex( 1.0,  1.0, 0, 1, 1),
    new Vertex(-1.0, -1.0, 0, 0, 0),
    new Vertex( 1.0,  1.0, 0, 1, 1),
    new Vertex(-1.0,  1.0, 0, 0, 1)
]

export const quadVertArray = Vertex.convertVertexArrIntoBufferStyle(vertices); 