#version 300 es
precision highp float;

in vec2 a_position;

void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    gl_PointSize = 10.0; // 점의 크기 설정
} 