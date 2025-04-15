/*-------------------------------------------------------------------------
11_CameraFP.js (Auto Moving Camera)

- Viewing a unit 3D cube at origin with perspective projection
- Camera automatically rotates around the origin in a circular path
- Y position oscillates up and down using sin function
---------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, Axes } from '/util.js';
import { Shader, readShaderFile } from '/shader.js';
import { Cube } from '/squarePyramid.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let startTime;
let lastFrameTime;
let isInitialized = false;

let modelMatrix = mat4.create();
let viewMatrix = mat4.create();
let projMatrix = mat4.create();
const cube = new Cube(gl);
const axes = new Axes(gl, 2.0);

let cameraPos = vec3.fromValues(0, 0, 5);
let cameraFront = vec3.fromValues(0, 0, -1);
let cameraUp = vec3.fromValues(0, 1, 0);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) {
        console.log("Already initialized");
        return;
    }

    main().then(success => {
        if (!success) {
            console.log('Program terminated');
            return;
        }
        isInitialized = true;
    }).catch(error => {
        console.error('Program terminated with error:', error);
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
    gl.clearColor(0.1, 0.2, 0.3, 1.0);

    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function render() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000.0;
    lastFrameTime = currentTime;
    const elapsedTime = (currentTime - startTime) / 1000.0;

    // Automatic camera movement
    const radius = 3.0;
    const omegaXZ = Math.PI / 2;  // 90 deg/sec
    const omegaY = Math.PI / 4;   // 45 deg/sec

    const camX = radius * Math.cos(omegaXZ * elapsedTime);
    const camZ = - radius * Math.sin(omegaXZ * elapsedTime);
    const camY = 10.0 * Math.abs(Math.sin(omegaY * elapsedTime));  // y in [0, 10]

    cameraPos = vec3.fromValues(camX, camY, camZ);

    const target = vec3.fromValues(0, 0, 0);
    vec3.subtract(cameraFront, target, cameraPos);
    vec3.normalize(cameraFront, cameraFront);

    mat4.lookAt(viewMatrix, cameraPos, target, cameraUp);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    cube.draw(shader);

    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

async function main() {
    try {
        if (!initWebGL()) throw new Error('Failed to initialize WebGL');

        shader = await initShader();

        mat4.perspective(
            projMatrix,
            glMatrix.toRadian(60),
            canvas.width / canvas.height,
            0.1,
            100.0
        );

        startTime = Date.now();
        lastFrameTime = startTime;

        requestAnimationFrame(render);
        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('Failed to initialize program');
        return false;
    }
}
