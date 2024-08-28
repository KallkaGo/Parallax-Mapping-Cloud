varying vec4 vViewPosition;
varying vec3 vCameraPosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec2 vUv;
varying vec3 vLightDir;

uniform vec3 uLightPos;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;
  gl_Position = projectionPosition;
  vLightDir = normalize(uLightPos - modelPosition.xyz);
  vViewPosition = viewPosition;
  vNormal = normalMatrix * normal;
  vWorldNormal = (modelMatrix * vec4(normal, 0.)).xyz;
  vCameraPosition = (viewMatrix * vec4(cameraPosition, 1.0)).xyz;
  vUv = uv;
}