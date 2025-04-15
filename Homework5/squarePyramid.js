export class Cube {
    constructor(gl, options = {}) {
        this.gl = gl;

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // 정점 위치 (5 faces: bottom + 4 sides)
        this.vertices = new Float32Array([
            // bottom face (2 triangles) on x-z plane (y = 0)
            -0.5, 0, -0.5,   0.5, 0, -0.5,   0.5, 0, 0.5,
             0.5, 0, 0.5,   -0.5, 0, 0.5,  -0.5, 0, -0.5,
        
            // side 1 (v0, v1, top)
            -0.5, 0, -0.5,   0.5, 0, -0.5,   0.0, 1, 0,
        
            // side 2 (v1, v2, top)
             0.5, 0, -0.5,   0.5, 0, 0.5,    0.0, 1, 0,
        
            // side 3 (v2, v3, top)
             0.5, 0, 0.5,   -0.5, 0, 0.5,    0.0, 1, 0,
        
            // side 4 (v3, v0, top)
            -0.5, 0, 0.5,   -0.5, 0, -0.5,   0.0, 1, 0
        ]);
        

        this.normals = new Float32Array([
            // bottom face (flat: 0, 0, -1)
            0, 0, -1,   0, 0, -1,   0, 0, -1,
            0, 0, -1,   0, 0, -1,   0, 0, -1,

            // side 1 normal (0, -1, 1) normalized
            0, -0.7071, 0.7071,   0, -0.7071, 0.7071,   0, -0.7071, 0.7071,

            // side 2 normal (1, 0, 1) normalized
            0.7071, 0, 0.7071,   0.7071, 0, 0.7071,   0.7071, 0, 0.7071,

            // side 3 normal (0, 1, 1) normalized
            0, 0.7071, 0.7071,   0, 0.7071, 0.7071,   0, 0.7071, 0.7071,

            // side 4 normal (-1, 0, 1) normalized
            -0.7071, 0, 0.7071,   -0.7071, 0, 0.7071,   -0.7071, 0, 0.7071
        ]);

        this.colors = new Float32Array([
            // bottom face - blue
            0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,
            0, 0, 1, 1,   0, 0, 1, 1,   0, 0, 1, 1,

            // side 1 - red
            1, 0, 0, 1,   1, 0, 0, 1,   1, 0, 0, 1,

            // side 2 - cyan
            0, 1, 1, 1,   0, 1, 1, 1,   0, 1, 1, 1,

            // side 3 - magenta
            1, 0, 1, 1,   1, 0, 1, 1,   1, 0, 1, 1,

            // side 4 - yellow
            1, 1, 0, 1,   1, 1, 0, 1,   1, 1, 0, 1,

        ]);

        this.texCoords = new Float32Array([
            // bottom face
            0, 0,   1, 0,   1, 1,
            1, 1,   0, 1,   0, 0,

            // side 1
            0, 0,   1, 0,   0.5, 1,

            // side 2
            0, 0,   1, 0,   0.5, 1,

            // side 3
            0, 0,   1, 0,   0.5, 1,

            // side 4
            0, 0,   1, 0,   0.5, 1
        ]);

        this.indices = new Uint16Array([
            0, 1, 2,   3, 4, 5,   // bottom (2 triangles)
            6, 7, 8,              // side 1
            9, 10, 11,            // side 2
            12, 13, 14,           // side 3
            15, 16, 17            // side 4
        ]);

        this.initBuffers();
    }

    initBuffers() {
        const gl = this.gl;

        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
