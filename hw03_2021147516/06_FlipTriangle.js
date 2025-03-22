import { resizeAspectRatio, setupText, updateText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;   // shader program
let vao;      // vertex array object
const translation = [0.0, 0.0]; 
let moveStep = 0.01;
const halfSize = 0.1;
const keysPressed = {};

function initWebGL() {
    if (!gl) {
        console.error('WebGL 2 is not supported by your browser.');
        return false;
    }

    canvas.width = 600;
    canvas.height = 600;

    resizeAspectRatio(gl, canvas);

    // Initialize WebGL settings
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    return true;
}

async function initShader() {
    const vertexShaderSource = await readShaderFile('shVert.glsl');
    const fragmentShaderSource = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

resizeAspectRatio

function setupKeyboardEvents() {
    window.addEventListener('keydown', (event) => {
        const key = event.key;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
            keysPressed[key] = true;
        }
    });

    window.addEventListener('keyup', (event) => {
        const key = event.key;
        delete keysPressed[key];
    });
}

function updatePosition() {
    let moved = false;

    if (keysPressed['ArrowUp'] && translation[1] + halfSize <= 1.0) {
        translation[1] += moveStep;
        moved = true;
    }
    if (keysPressed['ArrowDown'] && translation[1] - halfSize >= -1.0) {
        translation[1] -= moveStep;
        moved = true;
    }
    if (keysPressed['ArrowRight'] && translation[0] + halfSize <= 1.0) {
        translation[0] += moveStep;
        moved = true;
    }
    if (keysPressed['ArrowLeft'] && translation[0] - halfSize >= -1.0) {
        translation[0] -= moveStep;
        moved = true;
    }

    if (moved) {
        shader.setVec2("uTranslation", translation);  // shader에 이동값 전달
    }
}

function setupBuffers() {
    const vertices = new Float32Array([
        -halfSize, -halfSize, 0.0,
        halfSize, -halfSize, 0.0,
        halfSize,  halfSize, 0.0,
        -halfSize, halfSize, 0.0
    ]);

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

function render() {
    updatePosition();
    gl.clear(gl.COLOR_BUFFER_BIT);

    shader.use();
    shader.setVec4("uColor", [1.0, 0.0, 0.0, 1.0]);
    shader.setVec2("uTranslation", translation); // 항상 이동값 전달

    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    requestAnimationFrame(() => render());
}

async function main() {
    try {

        // WebGL 초기화
        if (!initWebGL()) {
            throw new Error('WebGL 초기화 실패');
        }

        // 셰이더 초기화
        await initShader();

        // setup text overlay (see util.js)
        setupText(canvas, "Use arrow keys to move the rectangle", 1);

        // 키보드 이벤트 설정
        setupKeyboardEvents();
        
        // 나머지 초기화
        setupBuffers(shader);
        
        // 렌더링 시작
        render();

        return true;

    } catch (error) {
        console.error('Failed to initialize program:', error);
        alert('프로그램 초기화에 실패했습니다.');
        return false;
    }
}

// call main function
main().then(success => {
    if (!success) {
        console.log('프로그램을 종료합니다.');
        return;
    }
}).catch(error => {
    console.error('프로그램 실행 중 오류 발생:', error);
});
