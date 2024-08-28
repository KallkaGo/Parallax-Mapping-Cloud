#include <packing>

// https://segmentfault.com/a/1190000003920502

varying vec4 vViewPosition;
varying vec3 vNormal;
varying vec3 vWorldNormal;
varying vec3 vLightDir;
varying vec3 vCameraPosition;
varying vec2 vUv;

uniform vec4 uHeightTileSpeed;
uniform sampler2D uCloudTex;
uniform float uHeightAmount;
uniform float uHeight;
uniform float uTime;
uniform vec3 uLightColor;

mat3 getTangentFrame(vec3 eye_pos, vec3 surf_norm, vec2 uv) {
  vec3 q0 = dFdx(eye_pos.xyz);
  vec3 q1 = dFdy(eye_pos.xyz);
  vec2 st0 = dFdx(uv.st);
  vec2 st1 = dFdy(uv.st);

  vec3 N = surf_norm; // normalized

  vec3 q1perp = cross(q1, N);
  vec3 q0perp = cross(N, q0);

  vec3 T = q1perp * st0.x + q0perp * st1.x;
  vec3 B = q1perp * st0.y + q0perp * st1.y;

  float det = max(dot(T, T), dot(B, B));
  float scale = (det == 0.0) ? 0.0 : inversesqrt(det);

  return mat3(T * scale, B * scale, N);

}

void main() {

  vec2 newUV = vUv * 3. + fract(uTime * uHeightTileSpeed.zw);

  vec2 newUV2 = vUv * uHeightTileSpeed.xy;

  vec3 shadeP = vec3(newUV, 0.0);

  vec3 shadeP2 = vec3(newUV2, 0.0);

  mat3 tbn = getTangentFrame(vViewPosition.xyz, vNormal, vUv);

  mat3 tbnInverse = inverse(tbn);

  vec3 viewDir = tbnInverse * (vCameraPosition - vViewPosition.xyz);

  viewDir = normalize(-viewDir);

  viewDir.z = abs(viewDir.z) + .2;

  viewDir.xy *= uHeight;

  float linearStep = 7.;

  vec4 tex = texture2D(uCloudTex, shadeP2.xy);

  float h = tex.a * uHeightAmount;

  vec3 lioffset = viewDir / (viewDir.z * linearStep);

  float d = 1. - texture2D(uCloudTex, shadeP.xy).a * h;

  float prev_d = d;

  vec3 prev_shadeP = shadeP;

  while(d > shadeP.z) {
    prev_shadeP = shadeP;
    shadeP += lioffset;
    prev_d = d;
    d = 1.0 - texture2D(uCloudTex, shadeP.xy).a * h;
  }

  float d1 = d - shadeP.z;
  float d2 = prev_d - prev_shadeP.z;
  float w = d1 / (d1 - d2);

  shadeP = mix(shadeP, prev_shadeP, w);

  vec3 col = texture2D(uCloudTex, shadeP.xy).rgb;

  vec3 lightDir = normalize(vLightDir);

  float NDotL = max(dot(normalize(vWorldNormal), lightDir), 0.0);

  vec3 finColor = col * (NDotL * uLightColor + 1. * .65);

  csm_FragColor = vec4(finColor, 1.0);
}