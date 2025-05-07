/*--------------------------------------------------------------------------------
18_SmoothShading.js

- Viewing a 3D unit cone at origin with perspective projection
- Rotating the cone by ArcBall interface (by left mouse button dragging)
- Keyboard controls:
    - 'a' to switch between camera and model rotation modes in ArcBall interface
    - 'r' to reset arcball
    - 's' to switch to smooth shading
    - 'f' to switch to flat shading
    - 'g' to switch to Gouraud shading (lighting in vertex shader)
    - 'p' to switch to Phong shading (lighting in fragment shader)
----------------------------------------------------------------------------------*/
import { resizeAspectRatio, setupText, updateText, Axes } from './util.js';
import { Shader, readShaderFile } from './shader.js';
import { Cube } from './cube.js';
import { Arcball } from './arcball.js';
import { Cone } from './cone.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let lampShader;
let textOverlay, textOverlay2, textOverlay3, textOverlay4, textOverlay5, textOverlay6, textOverlay7, textOverlay8, textOverlay9;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let lampModelMatrix = mat4.create();
let arcBallMode = 'CAMERA';     // 'CAMERA' or 'MODEL'
let shadingMode = 'SMOOTH';     // 'FLAT' or 'SMOOTH'

const cone = new Cone(gl, 32);
const lamp = new Cube(gl);
// const axes = new Axes(gl, 1.5);

const cameraPos = vec3.fromValues(0, 0, 3);
const lightPos = vec3.fromValues(1.0, 0.7, 1.0);
const lightSize = vec3.fromValues(0.1, 0.1, 0.1);

const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(success => {
        if (success) isInitialized = true;
    });
});

function setupKeyboardEvents() {
    document.addEventListener('keydown', (event) => {
        if (event.key == 'a') {
            arcBallMode = (arcBallMode === 'CAMERA') ? 'MODEL' : 'CAMERA';
            updateText(textOverlay2, "arcball mode: " + arcBallMode);
        } else if (event.key == 'r') {
            arcball.reset();
            modelMatrix = mat4.create(); 
            arcBallMode = 'CAMERA';
            updateText(textOverlay2, "arcball mode: " + arcBallMode);
        } else if (event.key == 's') {
            cone.copyVertexNormalsToNormals();
            cone.updateNormals();
            shadingMode = 'SMOOTH';
            updateText(textOverlay3, "shading mode: SMOOTH (" + currentLighting + ")");
            render();
        } else if (event.key == 'f') {
            cone.copyFaceNormalsToNormals();
            cone.updateNormals();
            shadingMode = 'FLAT';
            updateText(textOverlay3, "shading mode: FLAT (" + currentLighting + ")");
            render();
        } else if (event.key == 'g') {
            currentLighting = 'GOURAUD';
            initShader('gouraudVert.glsl', 'gouraudFrag.glsl').then(newShader => {
                shader = newShader;
                configureShader();
                updateText(textOverlay3, `shading mode: ${shadingMode} (GOURAUD)`);
                render();
            });
        } else if (event.key == 'p') {
            currentLighting = 'PHONG';
            initShader('shVert.glsl', 'shFrag.glsl').then(newShader => {
                shader = newShader;
                configureShader();
                updateText(textOverlay3, `shading mode: ${shadingMode} (PHONG)`);
                render();
            });
        }
    });
}

let currentLighting = 'Phong';

function configureShader() {
    shader.use();
    shader.setMat4("u_projection", projMatrix);
    shader.setVec3("material.diffuse", vec3.fromValues(1.0, 0.5, 0.31));
    shader.setVec3("material.specular", vec3.fromValues(0.5, 0.5, 0.5));
    shader.setFloat("material.shininess", 16);
    shader.setVec3("light.position", lightPos);
    shader.setVec3("light.ambient", vec3.fromValues(0.2, 0.2, 0.2));
    shader.setVec3("light.diffuse", vec3.fromValues(0.7, 0.7, 0.7));
    shader.setVec3("light.specular", vec3.fromValues(1.0, 1.0, 1.0));
    shader.setVec3("u_viewPos", cameraPos);
}

function initWebGL() {
    if (!gl) return false;
    canvas.width = 700;
    canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.7, 0.8, 0.9, 1.0);
    return true;
}

async function initShader(vPath = 'shVert.glsl', fPath = 'shFrag.glsl') {
    const vSrc = await readShaderFile(vPath);
    const fSrc = await readShaderFile(fPath);
    return new Shader(gl, vSrc, fSrc);
}

async function initLampShader() {
    const vSrc = await readShaderFile('shLampVert.glsl');
    const fSrc = await readShaderFile('shLampFrag.glsl');
    return new Shader(gl, vSrc, fSrc);
}

function render() {
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode === 'CAMERA') {
        viewMatrix = arcball.getViewMatrix();
    } else {
        modelMatrix = arcball.getModelRotMatrix();
        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setVec3('u_viewPos', cameraPos);
    cone.draw(shader);

    lampShader.use();
    lampShader.setMat4('u_view', viewMatrix);
    lamp.draw(lampShader);
    // axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

async function main() {
    if (!initWebGL()) return false;

    mat4.translate(viewMatrix, viewMatrix, cameraPos);
    mat4.perspective(projMatrix, glMatrix.toRadian(60), canvas.width / canvas.height, 0.1, 100);

    shader = await initShader();
    lampShader = await initLampShader();
    configureShader();

    lampShader.use();
    lampShader.setMat4("u_projection", projMatrix);
    mat4.translate(lampModelMatrix, lampModelMatrix, lightPos);
    mat4.scale(lampModelMatrix, lampModelMatrix, lightSize);
    lampShader.setMat4('u_model', lampModelMatrix);

    textOverlay = setupText(canvas, "Cone with Lighting");
    textOverlay2 = setupText(canvas, "arcball mode: " + arcBallMode, 2);
    textOverlay3 = setupText(canvas, "shading mode: " + shadingMode + " (" + currentLighting + ")", 3);
    textOverlay4 = setupText(canvas, "press 'a' to change arcball mode", 4);
    textOverlay5 = setupText(canvas, "press 'r' to reset arcball", 5);
    textOverlay6 = setupText(canvas, "press 's' to switch to smooth shading", 6);
    textOverlay7 = setupText(canvas, "press 'f' to switch to flat shading", 7);
    textOverlay8 = setupText(canvas, "press 'g' to switch to Gouraud shading", 8);
    textOverlay9 = setupText(canvas, "press 'p' to switch to Phong shading", 9);

    setupKeyboardEvents();
    requestAnimationFrame(render);
    return true;
}