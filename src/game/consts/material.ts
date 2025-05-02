import * as THREE from "three";

export const MATERIAL_UNIFORMS = THREE.UniformsUtils.merge([
  {
    ...THREE.UniformsLib.common,
    ...THREE.UniformsLib.lights,
    emissive: {
      value: new THREE.Color(0)
    },
    specular: {
      value: new THREE.Color(1118481)
    },
    shininess: {
      value: 30
    },
    tRamp: {
      value: null
    },
    tCloudsTop: {
      value: null
    },
    csmMap: {
      value: null
    },
    csmMatrix: {
      value: new THREE.Matrix4()
    },
    csmOptions: {
      value: new THREE.Vector4()
    },
    csmBiases: {
      value: new THREE.Vector2(.07,1e-6)
    },
    csmTarget: {
      value: new THREE.Vector3()
    }
  }
]);

export const GLOBAL_UBO = `
    uniform Global {
        vec2 resolution;
        float time;
        float dtRatio;
    };
`;

export const SINENOISE = `
    #define sinlayer(frX, frY, frZ) val += sin(dot(p, vec3(frX, frY, frZ)));
    
    float sinenoise1(vec3 p) {
        float val=0.0;sinlayer(1.5,3.4598,1.234);
        
        sinlayer(3.12,-3.234,4.221);
        sinlayer(0.355,2.3,-1.375);
        sinlayer(-0.156,-3.34,-0.4566);
        sinlayer(-4.1235,-0.485,-1.45);
        sinlayer(2.54,-0.879,-2.123);
        
        return val/6.0;
    }
`;

export const FIT = `
    float efit(float x,float a1,float a2,float b1,float b2) {
        return b1+((x-a1)*(b2-b1))/(a2-a1);
    }
    
    float fit(float x,float a1,float a2,float b1,float b2) {
        return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));
    }
    
    float fit01(float x,float a1,float a2) {
        return fit(x,0.0,1.0,a1,a2);
    }
    
    float fit10(float x,float a1,float a2) {
        return fit(x,1.0,0.0,a1,a2);
    }
    
    float fit11(float x,float a1,float a2) {
        return fit(x,-1.0,1.0,a1,a2);
    }
    
    vec3 efit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2) {
        return b1+((x-a1)*(b2-b1))/(a2-a1);
    }
    
    vec3 fit(vec3 x,vec3 a1,vec3 a2,vec3 b1,vec3 b2) {
        return clamp(efit(x,a1,a2,b1,b2),min(b1,b2),max(b1,b2));
    }
    
    vec3 fit01(vec3 x,vec3 a1,vec3 a2) {
        return fit(x,vec3(0.0),vec3(1.0),a1,a2);
    }
    
    vec3 fit10(vec3 x,vec3 a1,vec3 a2) {
        return fit(x,vec3(1.0),vec3(0.0),a1,a2);
    }
    
    vec3 fit11(vec3 x,vec3 a1,vec3 a2) {
        return fit(x,vec3(-1.0),vec3(1.0),a1,a2);
    }
`;

export const LINEAR_STEP = "float linearstep(float begin,float end,float t){return clamp((t-begin)/(end-begin),0.0,1.0);}";

export const COLOR_UTILS = `
    float luma(float color) {
        return color;
    }
    
    float luma(vec3 color) {
        return dot(color,vec3(0.299,0.587,0.114));
    }
    
    float luma(vec4 color) {
        return dot(color.rgb,vec3(0.299,0.587,0.114));
    }
    
    vec3 rgb2hsv(vec3 c) {
        vec4 K=vec4(0.0,-1.0/3.0,2.0/3.0,-1.0);
        vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
        vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
        float d=q.x-min(q.w,q.y);float e=1.0e-10;
        
        return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);
    }
    
    vec4 rgb2hsv(vec4 c) {
        return vec4(rgb2hsv(c.rgb),c.a);
    }
    
    vec3 hsv2rgb(vec3 c) {
        vec3 rgb=clamp(abs(mod(c.x*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);
        
        return c.z*mix(vec3(1.),rgb,c.y);
    }
    
    vec4 hsv2rgb(vec4 c) {
        return vec4(hsv2rgb(c.rgb),c.a);
    }
    
    vec4 rgbshift(sampler2D tex,vec2 uv,float angle,float amount) {
        vec2 offset=amount*vec2(cos(angle),sin(angle));
        vec4 cr=texture2D(tex,uv+offset);
        vec4 cga=texture2D(tex,uv);
        vec4 cb=texture2D(tex,uv-offset);
        
        return vec4(cr.r,cga.g,cb.b,cga.a);
    }
    
    vec3 colorpalette(float t,vec3 a,vec3 b,vec3 c,vec3 d) {
        return a+b*cos(6.28318*(c*t+d));
    }
    
    vec4 colorpalette(float t,vec4 a,vec4 b,vec4 c,vec4 d) {
        return a+b*cos(6.28318*(c*t+d));
    }
    
    float brightnessContrast(float color,float brightness,float contrast) {
        return(color-0.5)*contrast+0.5+brightness;
    }
    
    vec3 brightnessContrast(vec3 color,float brightness,float contrast) {
        return(color-0.5)*contrast+0.5+brightness;
    }
    
    vec4 brightnessContrast(vec4 color,float brightness,float contrast) {
        return vec4(brightnessContrast(color.rgb,brightness,contrast),color.a);
    }
    
    vec3 saturation(vec3 color,float adjustment) {
        const vec3 W=vec3(0.2125,0.7154,0.0721);
        vec3 intensity=vec3(dot(color,W));
        return mix(intensity,color,adjustment);
    }
    
    vec4 saturation(vec4 color,float adjustment) {
        return vec4(saturation(color.rgb,adjustment),color.a);
    }
    
    vec3 vibrance(vec3 color,float v) {
        float average=(color.r+color.g+color.b)/3.0;float mx=max(color.r,max(color.g,color.b));
        float amt=(mx-average)*(-v*3.0);return mix(color.rgb,vec3(mx),amt);
    }
    
    vec4 vibrance(vec4 color,float v) {
        return vec4(vibrance(color.rgb,v),color.a);
    }
`;

export const FOG_CHUNK = `
    void addFog(inout vec3 outcolor, float lenCam) {
        vec3 finalColor = rgb2hsv(outcolor);
        float fogDist = fit(lenCam, 40.0, 300.0, 0.0, 1.0);
        finalColor.b = mix(finalColor.b, 0.6, fogDist);
        finalColor.g = mix(finalColor.g, 0.3, fogDist);
        outcolor = hsv2rgb(finalColor);
    }
`;

export const CLOUDS_CHUNK = `
    vec2 cloudsUV1 = (wPos.xz * 0.003 + 31.232) + vec2(time * 0.0139 + 13.243, time * 0.02789 - 23.3) * 0.25;
    vec2 cloudsUV2 = wPos.xz * 0.003 - 65.1345 + vec2(time * -0.0123 + 113.82, time * 0.01525 - 34.234) * 0.25;
    float cloud_dither = rand(gl_FragCoord.xy) * 0.002;
    float cloudsMult1 = texture2D(tCloudsTop, cloudsUV1 + cloud_dither).r;
    float cloudsMult2 = texture2D(tCloudsTop, cloudsUV2 + cloud_dither).r;
    float cloudsMult = smoothstep(0.2, 0.9, cloudsMult1 * cloudsMult2);
`;

export const LIGHTS_FRAGMENT_BEGIN = `
/**
 * This is a template that can be used to light a material, it uses pluggable
 * RenderEquations (RE)for specific lighting scenarios.
 *
 * Instructions for use:
 * - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
 * - Create a material parameter that is to be passed as the third parameter to your lighting functions.
 *
 * TODO:
 * - Add area light support.
 * - Add sphere light support.
 * - Add diffuse light probe (irradiance cubemap) support.
 */

GeometricContext geometry;

geometry.position = - vViewPosition;
geometry.normal = normal;
geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

#ifdef USE_CLEARCOAT

	geometry.clearcoatNormal = clearcoatNormal;

#endif

#ifdef USE_IRIDESCENCE

	float dotNVi = saturate( dot( normal, geometry.viewDir ) );

	if ( material.iridescenceThickness == 0.0 ) {

		material.iridescence = 0.0;

	} else {

		material.iridescence = saturate( material.iridescence );

	}

	if ( material.iridescence > 0.0 ) {

		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );

		// Iridescence F0 approximation
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );

	}

#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointLightInfo( pointLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;

	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotLightInfo( spotLight, geometry, directLight );

		// spot lights are ordered [shadows with maps, shadows without maps, maps without shadows, none]
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif

		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif

		#undef SPOT_LIGHT_MAP_INDEX

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalLightInfo( directionalLight, geometry, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`;

export const TWEAKED_LIGHTS_FRAGMENT = () => {
  const searchStr = "directLight.color *= ";

  let fragment = LIGHTS_FRAGMENT_BEGIN;
  let startStr = fragment.indexOf(searchStr);

  const index = 0;

  while(startStr !== -1) {
    const s = fragment.indexOf(";", startStr);
    const e = fragment.substring(startStr, s);
    const i = e.substring(searchStr.length);

    fragment = fragment.replace(`${e};`, `
        float shadowTransition = linearstep(csmOptions.z, csmOptions.w, length(csmTarget - wPos));

        float _shadow${index} = shadowTransition < 0.999 && ${i};
        float _csmShadow${index} = shadowTransition > 0.001 ? getShadow(csmMap, vec2(csmOptions.x), csmBiases.y, csmOptions.y, vCsmShadowCoord) : 1.0;

        // shorten range and smooth shadow borders so shadowmap pixels are less obvious
        _shadow${index} = smoothstep(0.1, 0.9, _shadow${index});
        _csmShadow${index} = smoothstep(0.1, 1.0, _csmShadow${index});

        #ifndef IS_INTERIOR
            _shadow${index} = mix(_shadow${index}, _csmShadow${index}, shadowTransition);
        #endif

        // same as three.js
        directLight.color = directLight.color * _shadow${index};
    `);
    startStr = fragment.indexOf(searchStr)
  }

  return fragment;
};

export const VERTEX_SHADER = `
    //- edit

    #define PHONG

    ${GLOBAL_UBO}
    ${SINENOISE}
    ${FIT}

    varying vec3 vViewPosition;

    uniform mat4 csmMatrix;
    uniform vec2 csmBiases;
    varying vec4 vCsmShadowCoord;
    varying vec3 wPos;

    #include <common>
    #include <uv_pars_vertex>
    #include <color_pars_vertex>
    #include <normal_pars_vertex>

    #ifdef USE_SKINNING
            uniform mat4 bindMatrix;
            uniform mat4 bindMatrixInverse;
            uniform sampler2D boneTexture;
            uniform int boneTextureSize;

        #ifdef IS_CHARACTER
            attribute int instanceID;
            mat4 getBoneMatrix(const in float i) {
                int x = int(i) * 4;
                vec4 v1 = texelFetch(boneTexture, ivec2(x, instanceID), 0);
                vec4 v2 = texelFetch(boneTexture, ivec2(x + 1, instanceID), 0);
                vec4 v3 = texelFetch(boneTexture, ivec2(x + 2, instanceID), 0);
                vec4 v4 = texelFetch(boneTexture, ivec2(x + 3, instanceID), 0);
                mat4 bone = mat4(v1, v2, v3, v4);
                return bone;
            }
        #else
            mat4 getBoneMatrix( const in float i ) {
                float j = i * 4.0;
                float x = mod( j, float( boneTextureSize ) );
                float y = floor( j / float( boneTextureSize ) );
                float dx = 1.0 / float( boneTextureSize );
                float dy = 1.0 / float( boneTextureSize );
                y = dy * ( y + 0.5 );
                vec4 v1 = texture2D( boneTexture, vec2( dx * ( x + 0.5 ), y ) );
                vec4 v2 = texture2D( boneTexture, vec2( dx * ( x + 1.5 ), y ) );
                vec4 v3 = texture2D( boneTexture, vec2( dx * ( x + 2.5 ), y ) );
                vec4 v4 = texture2D( boneTexture, vec2( dx * ( x + 3.5 ), y ) );
                mat4 bone = mat4( v1, v2, v3, v4 );
                return bone;
            }
        #endif
    #endif

    #if defined(MULTICOLOR) || defined(USE_RAMP)
        attribute vec2 colorInfo;
        varying vec2 vColorInfo;
    #endif

    #if defined(SHAKE) || defined(GRASS)
        float hash13(vec3 p3) {
            p3  = fract(p3 * .1031);
            p3 += dot(p3, p3.zyx + 31.32);
            return fract((p3.x + p3.y) * p3.z);
        }
    #endif

    #ifdef REACT_CHARACTER
        uniform vec3 charPos;
        uniform float charSpeed;
    #endif

    #ifdef RANDOM_ATTRIB
        attribute vec4 random;
        varying vec4 vRand;
    #endif

    #ifdef IS_CHARACTER
        attribute float instanceSeed;
        varying float vSeed;
    #endif

    #include <shadowmap_pars_vertex>

    void main() {
        #include <uv_vertex>
        #include <beginnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #include <normal_vertex>
        #include <begin_vertex>
        #include <skinning_vertex>

        #ifdef IS_CHARACTER
            vSeed = instanceSeed;
        #endif

        #ifdef RANDOM_ATTRIB
            vRand = random;
        #endif

        vec4 mvPosition = vec4(transformed, 1.0);

        #ifdef PLANE_FACE_CHARACTER
            mvPosition.xz = vec2(viewMatrix[0][0], viewMatrix[2][0]) * mvPosition.x;
        #endif

        #ifdef USE_INSTANCING
            mvPosition = instanceMatrix * mvPosition;
        #endif

        vec4 worldPosition = modelMatrix * mvPosition;

        wPos = worldPosition.xyz;
        vec4 _wPos = worldPosition;

        #if defined(USE_RAMP)
            vColorInfo = colorInfo;
        #endif

        #ifdef SHAKE
            float mult = 1.0;
            #if defined(USE_RAMP)
                mult = colorInfo.y; // tree moving
            #endif

            #ifdef USE_INSTANCING
                float seed = hash13(instanceMatrix[3].xyz); // take tree/bush position
            #else
                float seed = hash13(_wPos.xyz); // use vertex position
            #endif

            #ifdef LIGHTWIRES
                float peri = _wPos.z * 0.05; // waviness
                float ttotal = (sin(time * 0.2 + peri) + 1.0) * 0.5;
                float amp = mult * ttotal * 0.75;
                _wPos.x += sin(time * 0.5 + peri) * amp;
            #else
                float disp = smoothstep(0.0, 2.0, mvPosition.y); //  bottom parts won't move as much
                float peri = _wPos.y * 0.3; // waviness
                float ttotal = (sin(time * (0.4 + 0.2 * seed) + seed * 120.2) + 1.0) * 0.5; // make them move only sometimes
                float amp = seed * disp * mult * ttotal * 0.2; // random multiplier from seed + limiters + max shake
                _wPos.x += sin(seed * 21.23 + time * 1.0 + peri) * amp;
                _wPos.z += sin(seed * 3.23 + time * 1.5 + peri) * amp;
            #endif
        #endif

        #ifdef GRASS
            float mult = step(0.1, position.y);
            vec3 grassPos = instanceMatrix[3].xyz;
            float grassdisp = 0.1 + 0.2 * random.x;
            float grassspeed = 0.25 + 0.3 * random.y;
            _wPos.x += sinenoise1(vec3(grassPos.x, 0.0, grassPos.z) * vec3(0.05) + time * grassspeed) * grassdisp * mult;
            _wPos.z += sinenoise1(vec3(grassPos.x, 0.0, grassPos.z) * vec3(0.1) + vec3(313.123) + time * grassspeed) * grassdisp * mult;

            vec3 grassCharDir = _wPos.xyz - charPos;
            float dist = length(grassCharDir);
            vec3 disp = normalize(grassCharDir) * fit(dist, 0.0, fit(charSpeed, 0.0, 0.01, 0.0, 1.25), 1.0, 0.0) * mult * 15.0 * charSpeed;
            _wPos.xz += disp.xz;
        #endif

        vec4 vPos = viewMatrix * _wPos;
        vViewPosition = -vPos.xyz;
        gl_Position = projectionMatrix * vPos;

        #include <shadowmap_vertex>

        vec3 csmWorldNormal = inverseTransformDirection(transformedNormal, viewMatrix);
        vec4 cmsWorldPosition = worldPosition + vec4(csmWorldNormal * csmBiases.x, 0); // shadow normal bias
        vCsmShadowCoord = csmMatrix * cmsWorldPosition;
    }
`;

export const FRAGMENT_SHADER =  `
    //- edit

    #define PHONG

    ${GLOBAL_UBO}
    ${LINEAR_STEP}
    ${FIT}
    ${COLOR_UTILS}
    ${FOG_CHUNK}

    uniform vec3 diffuse;
    uniform vec3 emissive;
    uniform vec3 specular;
    uniform float shininess;
    uniform float opacity;

    #ifdef IS_CHARACTER
        varying float vSeed;
    #endif

    #ifdef IS_TERRAIN
        uniform sampler2D tMasks;
        uniform sampler2D tTerrNoises;
        uniform sampler2D tTerrDetails;
        uniform vec3 grassColor1;
        uniform vec3 grassColor2;
    #endif

    #if defined(USE_RAMP)
        uniform sampler2D tRamp;
        varying vec2 vColorInfo;

        float getRamp(float index) {
            const float rampStep = 1.0 / 100.0;
            return 1.0 - index * rampStep + rampStep * 0.5;
        }
    #endif

    #ifdef RECEIVE_SHADOW_CLOUDS
        uniform sampler2D tCloudsTop;
    #endif

    uniform sampler2D csmMap;
    uniform vec4 csmOptions;
    uniform vec2 csmBiases;
    uniform vec3 csmTarget;
    varying vec4 vCsmShadowCoord;
    varying vec3 wPos;

    float lineFade(vec3 p, float size, float amount) {
        float h = size * 0.5;
        return 1.0 - step(amount * 1.01, (abs(mod(p.y, size) - h) / h));
    }

    float sphereFade(vec3 p, float size, float amount) {
        float h = size * 0.5;
        return clamp(1.0 - step(amount * 1.85, length(mod(p, size) - h) / h), 0.0, 1.0);
    }

    #include <common>
    #include <packing>
    #include <uv_pars_fragment>
    #include <map_pars_fragment>
    #include <bsdfs>
    #include <lights_pars_begin>
    #include <normal_pars_fragment>
    #include <lights_phong_pars_fragment>
    #include <shadowmap_pars_fragment>

    #ifdef RANDOM_ATTRIB
        varying vec4 vRand;
    #endif

    void main() {
        #ifndef IS_CHARACTER
            float dist = length(wPos - cameraPosition);
            float showAmount = lineFade(wPos, 0.015, linearstep(1.5, 2.0, dist));
            if (showAmount < 0.001) discard;
        #endif

        vec4 diffuseColor = vec4(diffuse, opacity);

        ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
        vec3 totalEmissiveRadiance = emissive;
        #include <specularmap_fragment>
        #include <normal_fragment_begin>

        // accumulation
        #include <lights_phong_fragment>

        // include <lights_fragment_begin>
        ${TWEAKED_LIGHTS_FRAGMENT()}

        #include <lights_fragment_end>

        vec3 diffuseSpecular = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular;

        #if NUM_DIR_LIGHTS > 0 && defined(USE_RAMP)
            DirectionalLight rampLight = directionalLights[0];
            float rampX = fit(dot(geometry.normal, rampLight.direction), -1.0, 1.0, 0.0, 1.0) * _shadow0;
            float rampStep = 1.0 / 100.0;

            #ifdef IS_TERRAIN
                // colors
                vec4 terrain = texture2D(tMasks, vUv);
                float path = smoothstep(0.35, 0.4, terrain.b);
                float road = smoothstep(0.35, 0.4, terrain.r);
                float bridge = terrain.a;

                vec3 colorGrass;
                vec3 colorPath;
                vec3 colorRoad;
                vec3 colorSand;
                vec3 colorBridge;

                // grass
                if (path < 1.0) {
                    colorGrass = mix(texture2D(tRamp, vec2(rampX, getRamp(48.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(49.0))).rgb, texture2D(tTerrNoises, wPos.xz * 0.03).r);
                    float maskGrass1 = texture2D(tTerrNoises, wPos.xz * 0.05).r;
                    float maskGrass2 = texture2D(tTerrNoises, wPos.xz * 0.1).r;
                    colorGrass = mix(colorGrass, grassColor1, texture2D(tTerrDetails, wPos.xz * 0.25).b * fit(_shadow0, 0.0, 1.0, 0.2, 1.0) * pow(maskGrass1, 2.0));
                    colorGrass = mix(colorGrass, grassColor2, texture2D(tTerrDetails, wPos.xz * 0.25).a * fit(_shadow0, 0.0, 1.0, 0.2, 1.0) * pow(maskGrass2, 2.0));
                }

                // path
                if (path > 0.0) {
                    colorPath = texture2D(tRamp, vec2(rampX, getRamp(50.0))).rgb;
                    colorPath += fit(texture2D(tTerrDetails, wPos.xz * 0.25).g, 0.0, 1.0, 0.0, 0.05) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0);
                }

                diffuseSpecular = mix(colorGrass, colorPath, path);

                // road
                if (road > 0.0) {
                    colorRoad = texture2D(tRamp, vec2(rampX, getRamp(52.0))).rgb;
                    colorRoad += fit(texture2D(tTerrDetails, wPos.xz * 0.5).r, 0.0, 1.0, 0.0, 0.05) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0);
                    colorRoad = mix(colorRoad, texture2D(tRamp, vec2(rampX, getRamp(63.0))).rgb, smoothstep(0.6, 0.65, texture2D(map, vUv).r));
                    diffuseSpecular = mix(diffuseSpecular, colorRoad, road);
                }

                // sand
                if (terrain.g > 0.0) {
                    colorSand = mix(texture2D(tRamp, vec2(rampX, getRamp(56.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(57.0))).rgb, texture2D(tTerrNoises, (wPos.xz + 63.6354) * 0.05).g);
                    colorSand += fit(texture2D(tTerrDetails, wPos.xz * 1.0).r, 0.0, 1.0, 0.0, 0.3) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0) * texture2D(tTerrNoises, wPos.xz * 1.5).r;
                    diffuseSpecular = mix(diffuseSpecular, colorSand, terrain.g);
                }

                // bridge
                if (bridge > 0.0) {
                    colorBridge = mix(texture2D(tRamp, vec2(rampX, getRamp(54.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(55.0))).rgb, texture2D(tTerrNoises, (wPos.xz + 63.6354) * 0.03).r);
                    diffuseSpecular = mix(diffuseSpecular, colorBridge, bridge);
                }

                // sea
                float beachZone = step(50.0, wPos.x);
                if (beachZone > 0.0) {
                    float seaYLevel = -0.815 + (sin(time * 0.5 + 23.124) + sin(time * 0.15 + 3213.32)) * 0.2 + (sin(time + wPos.z) * 0.01);
                    diffuseSpecular = mix(diffuseSpecular, vec3(1.0), step(wPos.y, seaYLevel + 0.025) * beachZone);
                }

                /*
                // defined paths with small pattern details
                vec3 colorPath = texture2D(tRamp, vec2(rampX, getRamp(50.0))).rgb;
                vec3 colorRoad = texture2D(tRamp, vec2(rampX, getRamp(52.0))).rgb;
                colorRoad += fit(texture2D(tTerrDetails, wPos.xz * 0.5).r, 0.0, 1.0, 0.0, 0.05) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0);

                // road details
                colorRoad = mix(colorRoad, texture2D(tRamp, vec2(rampX, getRamp(63.0))).rgb, smoothstep(0.6, 0.65, texture2D(map, vUv).r));

                colorPath += fit(texture2D(tTerrDetails, wPos.xz * 0.25).g, 0.0, 1.0, 0.0, 0.05) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0);

                // special cases with more variation or custom colors
                vec3 colorGrass = mix(texture2D(tRamp, vec2(rampX, getRamp(48.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(49.0))).rgb, texture2D(tTerrNoises, wPos.xz * 0.03).r);
                vec3 colorSand = mix(texture2D(tRamp, vec2(rampX, getRamp(56.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(57.0))).rgb, texture2D(tTerrNoises, (wPos.xz + 63.6354) * 0.05).g);
                vec3 colorBridge = mix(texture2D(tRamp, vec2(rampX, getRamp(54.0))).rgb, texture2D(tRamp, vec2(rampX, getRamp(55.0))).rgb, texture2D(tTerrNoises, (wPos.xz + 63.6354) * 0.03).r);

                float maskGrass1 = texture2D(tTerrNoises, wPos.xz * 0.05).r;
                float maskGrass2 = texture2D(tTerrNoises, wPos.xz * 0.1).r;
                colorGrass = mix(colorGrass, grassColor1, texture2D(tTerrDetails, wPos.xz * 0.25).b * fit(_shadow0, 0.0, 1.0, 0.2, 1.0) * pow(maskGrass1, 2.0));
                colorGrass = mix(colorGrass, grassColor2, texture2D(tTerrDetails, wPos.xz * 0.25).a * fit(_shadow0, 0.0, 1.0, 0.2, 1.0) * pow(maskGrass2, 2.0));
                colorSand += fit(texture2D(tTerrDetails, wPos.xz * 1.0).r, 0.0, 1.0, 0.0, 0.3) * fit(_shadow0, 0.0, 1.0, 0.3, 1.0) * texture2D(tTerrNoises, wPos.xz * 1.5).r;

                // final layering of colors
                diffuseSpecular = mix(colorGrass, colorPath, path);
                diffuseSpecular = mix(diffuseSpecular, colorRoad, road);
                diffuseSpecular = mix(diffuseSpecular, colorSand, terrain.g);
                diffuseSpecular = mix(diffuseSpecular, colorBridge, bridge);

                // foam
                float beachZone = step(50.0, wPos.x);
                float seaYLevel = -0.815 + (sin(time * 0.5 + 23.124) + sin(time * 0.15 + 3213.32)) * 0.2 + (sin(time + wPos.z) * 0.01);
                diffuseSpecular = mix(diffuseSpecular, vec3(1.0), step(wPos.y, seaYLevel + 0.025) * beachZone);
                */

            #else
                #ifdef GRASS
                    // patches / opacity
                    const float grassPatches = 8.0;
                    const float grassPatchStep = 1.0 / grassPatches;
                    float grassID = floor(vRand.w * grassPatches);
                    vec2 uvgrass = vec2(grassID * grassPatchStep + vUv.x * grassPatchStep, vUv.y + 0.015);
                    vec4 grassPatch = texture2D(map, uvgrass);

                    diffuseColor.a = pow(grassPatch.a, 5.0);

                    // alpha
                    if (diffuseColor.a < 0.01) discard;

                    // save shadow contribution
                    float shadowMult = _shadow0;

                    // select ramp: 58 - 59 and get color
                    float rampID = 58.0 + step(0.8, fract(vRand.x + vRand.y));
                    diffuseSpecular = texture2D(tRamp, vec2(_shadow0, getRamp(rampID))).rgb;
                    diffuseSpecular *= fit(vUv.y, 0.0, 0.75, 1.0, 1.25);
                #elif defined(IS_CHARACTER)
                    if (vColorInfo.y < 0.01) { // not changing parts
                        float rampY = getRamp(vColorInfo.r);
                        diffuseSpecular = texture2D(tRamp, vec2(rampX, rampY)).rgb;
                    } else if (vColorInfo.y < 1.01) {
                        // skin
                        float rampY = getRamp(79.0 + clamp(floor(vSeed), 0.0, 3.0));
                        diffuseSpecular = texture2D(tRamp, vec2(rampX, rampY)).rgb;
                    } else {
                        // player color
                        vec3 cc_color = vec3(0.0);
                        cc_color.x = fract(vSeed);
                        cc_color.y = 0.4;

                        const float ss_step = 0.3;
                        cc_color.z = 0.2 + floor(rampX * 2.99) * ss_step;
                        diffuseSpecular = hsv2rgb(cc_color);
                    }
                #elif defined(GOSSIP)
                    float rampY = getRamp(vColorInfo.r);
                    vec3 col = texture2D(tRamp, vec2(rampX, rampY)).rgb;

                    if (vColorInfo.y < 0.01) {
                        float mask = texture2D(map, vUv).r;
                        diffuseSpecular = mix(texture2D(tRamp, vec2(mask, getRamp(89.0))).rgb, col, fit(mask, 0.7, 0.68, 1.0, 0.0));
                    } else {
                        diffuseSpecular = col;
                    }
                #else
                    float rampY = getRamp(vColorInfo.r);
                    diffuseSpecular = texture2D(tRamp, vec2(rampX, rampY)).rgb;
                #endif
            #endif
        #endif

        // add clouds
        #ifdef RECEIVE_SHADOW_CLOUDS
            ${CLOUDS_CHUNK}
            diffuseSpecular *= fit(cloudsMult, 0.0, 1.0, 0.7, 1.0);
        #endif

        vec3 outgoingLight = diffuseSpecular + totalEmissiveRadiance;
        float lenCam = length(-vViewPosition);

        addFog(outgoingLight, lenCam);

        gl_FragColor = vec4(outgoingLight, diffuseColor.a);

        #ifdef FADE_AWAY
            gl_FragColor.a *= smoothstep(FADE_AWAY, FADE_AWAY - 5.0, length(lenCam));
        #endif
    }
`;
