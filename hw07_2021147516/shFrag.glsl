#version 300 es
precision highp float;

in vec3 fragPos;  
in vec3 normal;  
out vec4 FragColor;

struct Material {
    vec3 diffuse;       // surface's diffuse color
    vec3 specular;      // surface's specular color
    float shininess;    // specular shininess
};

struct Light {
    vec3 position;      // light position
    vec3 ambient;       // ambient strength
    vec3 diffuse;       // diffuse strength
    vec3 specular;      // specular strength
};

uniform Material material;
uniform Light light;
uniform vec3 u_viewPos;

void main() {
    // ambient
    vec3 rgb = material.diffuse;
    vec3 ambient = light.ambient * rgb;

    // normalize vectors
    vec3 norm = normalize(normal);
    vec3 lightDir = normalize(light.position - fragPos);
    vec3 viewDir = normalize(u_viewPos - fragPos);

    // diffuse
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * rgb;

    // specular
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * material.specular;

    // 최종 색 계산
    vec3 result = ambient + diffuse + specular;
    FragColor = vec4(result, 1.0);
}
