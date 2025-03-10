// Global constants
const canvas = document.getElementById('glCanvas'); // Get the canvas element 
const gl = canvas.getContext('webgl2'); // Get the WebGL2 context

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Start rendering
render();

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw something here

    // each size of square is half of canvas
    const square_width = canvas.width / 2;
    const square_height = canvas.height / 2;

    // using scissor, fill four color each area
    gl.enable(gl.SCISSOR_TEST);

    // red
    gl.scissor(0, square_height, square_width, square_height);
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // green
    gl.scissor(square_width, square_height, square_width, square_height);
    gl.clearColor(0.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // blue
    gl.scissor(0, 0, square_width, square_height);
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // yellow
    gl.scissor(square_width, 0, square_width, square_height);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);


}

// Resize viewport when window size changes
// Set canvas size to minimum (window size)
// between window.innerWidth and innerHeight
window.addEventListener('resize', () => {
    if(window.innerHeight < window.innerWidth){
        canvas.width = window.innerHeight;
        canvas.height = window.innerHeight;
    }
    else{
        canvas.width = window.innerWidth;
        canvas.height = window.innerWidth ;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});

