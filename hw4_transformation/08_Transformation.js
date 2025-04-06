/*-------------------------------------------------------------------------
08_Transformation.js

canvas의 중심에 한 edge의 길이가 0.3인 정사각형을 그리고, 
이를 크기 변환 (scaling), 회전 (rotation), 이동 (translation) 하는 예제임.
    T는 x, y 방향 모두 +0.5 만큼 translation
    R은 원점을 중심으로 2초당 1회전의 속도로 rotate
    S는 x, y 방향 모두 0.3배로 scale
이라 할 때, 
    keyboard 1은 TRS 순서로 적용
    keyboard 2는 TSR 순서로 적용
    keyboard 3은 RTS 순서로 적용
    keyboard 4는 RST 순서로 적용
    keyboard 5는 STR 순서로 적용
    keyboard 6은 SRT 순서로 적용
    keyboard 7은 원래 위치로 돌아옴
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

let isInitialized = false;
const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let axesVAO;
let cubeVAO;
let finalSunTransform;
let finalEarthTransform;
let finalMoonTransform;
let earthMono;
let SunRotationAngle = 0;
let EarthRotationAngle = 0;
let MoonRotationAngle = 0;
let rotationAngle = 0;
let lastTime = 0;

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('프로그램을 종료합니다.');
            return;
        }
        isInitialized = true;
        requestAnimationFrame(animate);
    }).catch(error => {
        console.error('프로그램 실행 중 오류 발생:', error);
    });
});

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.2, 0.3, 0.4, 1.0);
    
    return true;
}

function setupAxesBuffers(shader) {
    axesVAO = gl.createVertexArray();
    gl.bindVertexArray(axesVAO);

    const axesVertices = new Float32Array([
        -1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // x축
        0.0, -1.0, 0.0, 0.0, 1.0, 0.0   // y축
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
}

function setupCubeBuffers(shader) {
    const cubeVertices = new Float32Array([
        -0.50,  0.50, 0.0, // 좌상단
        -0.50, -0.50, 0.0, // 좌하단
         0.50, -0.50, 0.0, // 우하단
         0.50,  0.50, 0.0   // 우상단
    ]);

    const indices = new Uint16Array([
        0, 1, 2,    // 첫 번째 삼각형
        0, 2, 3     // 두 번째 삼각형
    ]);

    cubeVAO = gl.createVertexArray();
    gl.bindVertexArray(cubeVAO);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
    shader.setAttribPointer("a_position", 3, gl.FLOAT, false, 0, 0);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}


function applyAllTransforms() {
    const S_R = mat4.create();
    const S_S = mat4.create();

    const E_T = mat4.create();
    const E_R = mat4.create();
    const E_R2 = mat4.create();
    const E_S = mat4.create();

    const M_T = mat4.create();
    const M_R = mat4.create();
    const M_R2 = mat4.create();
    const M_S = mat4.create();

    mat4.scale(S_S, S_S, [0.2, 0.2, 1]);
    mat4.rotate(S_R, S_R, SunRotationAngle, [0, 0, 1]);

    mat4.translate(E_T, E_T, [0.7, 0.0, 0]);
    mat4.scale(E_S, E_S, [0.1, 0.1, 1]);
    mat4.rotate(E_R, E_R, EarthRotationAngle, [0, 0, 1]); // 공전 30도
    mat4.rotate(E_R2, E_R2, rotationAngle, [0, 0, 1]); // 자전 180도

    mat4.translate(M_T, M_T, [0.2, 0.0, 0]);
    mat4.scale(M_S, M_S, [0.05, 0.05, 1]);
    mat4.rotate(M_R, M_R, MoonRotationAngle, [0, 0, 1]); // 공전 360도
    mat4.rotate(M_R2, M_R2, rotationAngle, [0, 0, 1]); // 자전 180도

    // SUN = SR
    finalSunTransform = mat4.create();
    mat4.multiply(finalSunTransform, S_S, finalSunTransform);
    mat4.multiply(finalSunTransform, S_R, finalSunTransform);

    // EARTH = STR
    earthMono = mat4.create();
    finalEarthTransform = mat4.create();
    mat4.multiply(finalEarthTransform, E_S, finalEarthTransform);
    mat4.multiply(finalEarthTransform, E_R2, finalEarthTransform);
    mat4.multiply(finalEarthTransform, E_T, finalEarthTransform);
    mat4.multiply(finalEarthTransform, E_R, finalEarthTransform);
    

    // Earth 기준 좌표계계
    mat4.multiply(earthMono, E_T, earthMono);
    mat4.multiply(earthMono, E_R, earthMono);

    // MOON = S
    finalMoonTransform = mat4.create();
    mat4.multiply(finalMoonTransform, M_S, finalMoonTransform);
    mat4.multiply(finalMoonTransform, M_R2, finalMoonTransform);
    mat4.multiply(finalMoonTransform, M_T, finalMoonTransform);
    mat4.multiply(finalMoonTransform, M_R, finalMoonTransform);
    mat4.multiply(finalMoonTransform, earthMono, finalMoonTransform);
}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    shader.use();
``
    // 축 그리기
    shader.setMat4("u_model", mat4.create());

    gl.bindVertexArray(axesVAO);
    shader.setVec4("u_color", [1.0, 0.3, 0.0, 1.0]);
    gl.drawArrays(gl.LINES, 0, 2);

    gl.bindVertexArray(axesVAO);
    shader.setVec4("u_color", [0.0, 1.0, 0.5, 1.0]);
    gl.drawArrays(gl.LINES, 2, 2);
    

    // Draw SUN
    shader.setMat4("u_model", finalSunTransform);
    shader.setVec4("u_color", [1.0, 0.0, 0.0, 1.0]);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // Draw EARTH
    shader.setMat4("u_model", finalEarthTransform);
    shader.setVec4("u_color", [0.0, 1.0, 1.0, 1.0]);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

    // Draw MOON
    shader.setMat4("u_model", finalMoonTransform);
    shader.setVec4("u_color", [1.0, 1.0, 0.0, 1.0]);
    gl.bindVertexArray(cubeVAO);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

}

function animate(currentTime) {
    if (!lastTime) lastTime = currentTime;
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    SunRotationAngle += Math.PI * 0.25 * deltaTime; // 45
    rotationAngle += Math.PI * 1 * deltaTime; // 180
    MoonRotationAngle += Math.PI * 2 * deltaTime; // 360
    EarthRotationAngle += Math.PI / 6 * deltaTime; // 30
    applyAllTransforms();
    render();
    requestAnimationFrame(animate);
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
    try {
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        finalSunTransform = mat4.create();
        finalEarthTransform = mat4.create();
        finalMoonTransform = mat4.create();
        
        shader = await initShader();
        setupAxesBuffers(shader);
        setupCubeBuffers(shader);
        shader.use();
        return true;
    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}
