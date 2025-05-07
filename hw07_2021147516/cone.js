export class Cone {
    constructor(gl, segments = 32, options = {}) {
        this.gl = gl;
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        const radius = 0.5;
        const height = 1.0;
        const angleStep = (2 * Math.PI) / segments;

        const defaultColor = [0.8, 0.8, 0.8, 1.0];
        const colorOption = options.color || defaultColor;

        const positions = [];
        const faceNormals = [];
        const vertexNormals = [];
        const colors = [];
        const texCoords = [];
        const indices = [];

        for (let i = 0; i < segments; i++) {
            const angle0 = i * angleStep;
            const angle1 = (i + 1) * angleStep;

            // 각 삼각형의 정점 좌표
            const tip = [0.0, height / 2.0, 0.0];
            const b0 = [radius * Math.cos(angle0), -height / 2.0, radius * Math.sin(angle0)];
            const b1 = [radius * Math.cos(angle1), -height / 2.0, radius * Math.sin(angle1)];

            // ✅ 면 법선 계산 (순서 반대로!)
            const v1 = [b1[0] - tip[0], b1[1] - tip[1], b1[2] - tip[2]];
            const v2 = [b0[0] - tip[0], b0[1] - tip[1], b0[2] - tip[2]];
            const nx = v1[1] * v2[2] - v1[2] * v2[1];
            const ny = v1[2] * v2[0] - v1[0] * v2[2];
            const nz = v1[0] * v2[1] - v1[1] * v2[0];
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            const fn = [nx / len, ny / len, nz / len];

            // smooth normals
            const n_tip = [0, 1, 0];
            const n_b0 = [b0[0], 0, b0[2]];
            const n_b1 = [b1[0], 0, b1[2]];
            const l_b0 = Math.sqrt(n_b0[0] * n_b0[0] + n_b0[2] * n_b0[2]);
            const l_b1 = Math.sqrt(n_b1[0] * n_b1[0] + n_b1[2] * n_b1[2]);
            for (let j = 0; j < 3; j++) {
                n_b0[j] = j === 1 ? 0 : n_b0[j] / l_b0;
                n_b1[j] = j === 1 ? 0 : n_b1[j] / l_b1;
            }

            const baseIndex = positions.length / 3;

            for (const [pos, vn] of [[tip, n_tip], [b0, n_b0], [b1, n_b1]]) {
                positions.push(...pos);
                vertexNormals.push(...vn);
                faceNormals.push(...fn);
                colors.push(...colorOption);
                texCoords.push(0.5, 1.0); // UV 미사용
            }

            indices.push(baseIndex, baseIndex + 1, baseIndex + 2);
        }

        this.vertices = new Float32Array(positions);
        this.normals = new Float32Array(vertexNormals); // 기본은 smooth 시작
        this.vertexNormals = new Float32Array(vertexNormals);
        this.faceNormals = new Float32Array(faceNormals);
        this.colors = new Float32Array(colors);
        this.texCoords = new Float32Array(texCoords);
        this.indices = new Uint16Array(indices);

        this.initBuffers();
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
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

        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    updateNormals() {
        const gl = this.gl;
        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        const vSize = this.vertices.byteLength;
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
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
