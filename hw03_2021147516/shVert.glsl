#version 300 es

layout (location = 0) in vec3 aPos;

uniform vec2 uTranslation;

void main() {
    vec3 pos = aPos;
    pos.xy += uTranslation;
    gl_Position = vec4(pos, 1.0);
}