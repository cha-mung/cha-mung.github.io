#version 300 es
precision highp float;

layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNormal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform vec3 u_viewPos;

struct Material {
    vec3 diffuse;
    vec3 specular;
    float shininess;
};
uniform Material material;

struct Light {
    vec3 position;
    vec3 ambient;
    vec3 diffuse;
    vec3 specular;
};
uniform Light light;

out vec3 vertexColor;

void main() {
    vec3 fragPos = vec3(u_model * vec4(aPos, 1.0));
    vec3 norm = normalize(mat3(transpose(inverse(u_model))) * aNormal);
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(u_viewPos - fragPos);
    vec3 reflectDir = reflect(-lightDir, norm);

    // ambient
    vec3 ambient = light.ambient * material.diffuse;

    // diffuse
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * material.diffuse;

    // specular
    float spec = 0.0;
    if (diff > 0.0) {
        spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    }
    vec3 specular = light.specular * spec * material.specular;

    vertexColor = ambient + diffuse + specular;

    gl_Position = u_projection * u_view * vec4(fragPos, 1.0);
}
