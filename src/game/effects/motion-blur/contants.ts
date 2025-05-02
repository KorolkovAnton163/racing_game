export const MOTION_BLUR_VERTEX_SHADER = `
  varying vec2 vUv;
  
  void mainSupport(const in vec2 uv) {
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
    vUv = uv;
  }
`;

export const MOTION_BLUR_FRAGMENT_SHADER = `
varying vec2 vUv;

uniform sampler2D tDepth;
uniform sampler2D tColor;

uniform mat4 clipToWorldMatrix;
uniform mat4 previousWorldToClipMatrix;

uniform vec3 cameraMove;

uniform float velocityFactor;
uniform float delta;
 
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  float zOverW = texture2D(tDepth, vUv).x;

  // clipPosition is the viewport position at this pixel in the range -1 to 1.
  vec4 clipPosition = vec4(vUv.x * 2. - 1., vUv.y * 2. - 1., zOverW * 2. - 1., 1.);

  vec4 worldPosition = clipToWorldMatrix * clipPosition;
  worldPosition /= worldPosition.w;

  vec4 previousClipPosition = worldPosition;

  // Reduce motion blur due to camera translation especially at the screen center.
  previousClipPosition.xyz -= cameraMove * (
    1. - smoothstep(.3, 1., clamp(length(clipPosition.xy), 0., 1.))
  );

  previousClipPosition = previousWorldToClipMatrix * previousClipPosition;
  previousClipPosition /= previousClipPosition.w;

  vec2 velocity = velocityFactor * (clipPosition - previousClipPosition).xy / delta * 16.67;

  vec4 finalColor = vec4(0.);
  vec2 offset = vec2(0.);
  float weight = 0.;
  const int samples = 20;
  
  for(int i = 0; i < samples; i++) {
       offset = velocity * (float(i) / (float(samples) - 1.) - .5);
       vec4 c = texture2D(tColor, vUv + offset);
       finalColor += c;
  }
  
  finalColor /= float(samples);
  outputColor = vec4(finalColor.rgb, 1.);
 }
`;
