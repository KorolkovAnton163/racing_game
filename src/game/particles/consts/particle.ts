export const PARTICLE_SHADER = {
    vertex: /* glsl */`
        #define PACKED_COLOR_SIZE 256.0
        #define PACKED_COLOR_DIVISOR 255.0
        uniform float deltaTime;
        uniform float runTime;
        uniform sampler2D tex;
        uniform vec4 textureAnimation;
        uniform float scale;
        attribute vec4 acceleration;
        attribute vec3 velocity;
        attribute vec4 rotation;
        attribute vec3 rotationCenter;
        attribute vec4 params;
        attribute vec4 size;
        attribute vec4 angle;
        attribute vec4 color;
        attribute vec4 opacity;
        varying vec4 vColor;
        
        #ifdef SHOULD_ROTATE_TEXTURE
            varying float vAngle;
        #endif
        
        #ifdef SHOULD_CALCULATE_SPRITE
            varying vec4 vSpriteSheet;
        #endif
        
        #define PI 3.141592653589793
        #define PI2 6.283185307179586
        #define PI_HALF 1.5707963267948966
        #define RECIPROCAL_PI 0.3183098861837907
        #define RECIPROCAL_PI2 0.15915494309189535
        #define EPSILON 1e-6
        
        #ifndef saturate
        #define saturate( a ) clamp( a, 0.0, 1.0 )
        #endif
        
        #define whiteComplement( a ) ( 1.0 - saturate( a ) )
        
        float pow2( const in float x ) { return x*x; }
        vec3 pow2( const in vec3 x ) { return x*x; }
        float pow3( const in float x ) { return x*x*x; }
        float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
        float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
        float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
        highp float rand( const in vec2 uv ) {
            const highp float a = 12.9898, b = 78.233, c = 43758.5453;
            highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
            return fract( sin( sn ) * c );
        }
        
        #ifdef HIGH_PRECISION
            float precisionSafeLength( vec3 v ) { return length( v ); }
        #else
            float precisionSafeLength( vec3 v ) {
            float maxComponent = max3( abs( v ) );
                return length( v / maxComponent ) * maxComponent;
            }
        #endif
        
        struct IncidentLight {
            vec3 color;
            vec3 direction;
            bool visible;
        };
        
        struct ReflectedLight {
            vec3 directDiffuse;
            vec3 directSpecular;
            vec3 indirectDiffuse;
            vec3 indirectSpecular;
        };
        
        struct GeometricContext {
            vec3 position;
            vec3 normal;
            vec3 viewDir;
            #ifdef USE_CLEARCOAT
                vec3 clearcoatNormal;
            #endif
        };
        
        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
            return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
        }
        
        vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
            return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
        }
        
        mat3 transposeMat3( const in mat3 m ) {
            mat3 tmp;
            tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
            tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
            tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
            return tmp;
        }
        
        float luminance( const in vec3 rgb ) {
            const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
            return dot( weights, rgb );
        }
        
        bool isPerspectiveMatrix( mat4 m ) {
            return m[ 2 ][ 3 ] == - 1.0;
        }
        
        vec2 equirectUv( in vec3 dir ) {
        float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
        
        float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
            return vec2( u, v );
        }
        
        float w0( float a ) {
            return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
        }
        
        float w1( float a ) {
            return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
        }
        
        float w2( float a ){
            return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
        }
        
        float w3( float a ) {
            return ( 1.0 / 6.0 ) * ( a * a * a );
        }
        
        float g0( float a ) {
            return w0( a ) + w1( a );
        }
        
        float g1( float a ) {
            return w2( a ) + w3( a );
        }
        
        float h0( float a ) {
            return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
        }
        
        float h1( float a ) {
            return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
        }
        
        vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, vec2 fullSize, float lod ) {
            uv = uv * texelSize.zw + 0.5;
            vec2 iuv = floor( uv );
            vec2 fuv = fract( uv );
            float g0x = g0( fuv.x );
            float g1x = g1( fuv.x );
            float h0x = h0( fuv.x );
            float h1x = h1( fuv.x );
            float h0y = h0( fuv.y );
            float h1y = h1( fuv.y );
            vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
            vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
            vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
            vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
            
            vec2 lodFudge = pow( 1.95, lod ) / fullSize;
            
            return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
                g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
        }
        
        vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
            vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
            vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
            vec2 fLodSizeInv = 1.0 / fLodSize;
            vec2 cLodSizeInv = 1.0 / cLodSize;
            vec2 fullSize = vec2( textureSize( sampler, 0 ) );
            vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), fullSize, floor( lod ) );
            vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), fullSize, ceil( lod ) );
            return mix( fSample, cSample, fract( lod ) );
        }
        
        #ifdef USE_LOGDEPTHBUF
        #ifdef USE_LOGDEPTHBUF_EXT
            varying float vFragDepth;
            varying float vIsPerspective;
        #else
            uniform float logDepthBufFC;
        #endif
        #endif
        
        #ifdef USE_FOG
            varying float vFogDepth;
        #endif
        
        float when_gt(float x, float y) {
            return max(sign(x - y), 0.0);
        }
        
        float when_lt(float x, float y) {
            return min( max(1.0 - sign(x - y), 0.0), 1.0 );
        }
        
        float when_eq( float x, float y ) {
            return 1.0 - abs( sign( x - y ) );
        }
        
        float when_ge(float x, float y) {
          return 1.0 - when_lt(x, y);
        }
        
        float when_le(float x, float y) {
          return 1.0 - when_gt(x, y);
        }
        
        float and(float a, float b) {
            return a * b;
        }
        
        float or(float a, float b) {
            return min(a + b, 1.0);
        }
        
        vec3 unpackColor( in float hex ) {
           vec3 c = vec3( 0.0 );
           float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
           float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
           float b = mod( hex, PACKED_COLOR_SIZE );
           c.r = r / PACKED_COLOR_DIVISOR;
           c.g = g / PACKED_COLOR_DIVISOR;
           c.b = b / PACKED_COLOR_DIVISOR;
           return c;
        }
        
        vec3 unpackRotationAxis( in float hex ) {
           vec3 c = vec3( 0.0 );
           float r = mod( (hex / PACKED_COLOR_SIZE / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
           float g = mod( (hex / PACKED_COLOR_SIZE), PACKED_COLOR_SIZE );
           float b = mod( hex, PACKED_COLOR_SIZE );
           c.r = r / PACKED_COLOR_DIVISOR;
           c.g = g / PACKED_COLOR_DIVISOR;
           c.b = b / PACKED_COLOR_DIVISOR;
           c *= vec3( 2.0 );
           c -= vec3( 1.0 );
           return c;
        }
        
        float getFloatOverLifetime( in float positionInTime, in vec4 attr ) {
            highp float value = 0.0;
            float deltaAge = positionInTime * float( VALUE_OVER_LIFETIME_LENGTH - 1 );
            float fIndex = 0.0;
            float shouldApplyValue = 0.0;
            value += attr[ 0 ] * when_eq( deltaAge, 0.0 );
        
            for( int i = 0; i < VALUE_OVER_LIFETIME_LENGTH - 1; ++i ) {
               fIndex = float( i );
               shouldApplyValue = and( when_gt( deltaAge, fIndex ), when_le( deltaAge, fIndex + 1.0 ) );
               value += shouldApplyValue * mix( attr[ i ], attr[ i + 1 ], deltaAge - fIndex );
            }
        
            return value;
        }
        
        vec3 getColorOverLifetime( in float positionInTime, in vec3 color1, in vec3 color2, in vec3 color3, in vec3 color4 ) {
            vec3 value = vec3( 0.0 );
            value.x = getFloatOverLifetime( positionInTime, vec4( color1.x, color2.x, color3.x, color4.x ) );
            value.y = getFloatOverLifetime( positionInTime, vec4( color1.y, color2.y, color3.y, color4.y ) );
            value.z = getFloatOverLifetime( positionInTime, vec4( color1.z, color2.z, color3.z, color4.z ) );
            return value;
        }
        
        float getAlive() {
           return params.x;
        }
        
        float getAge() {
           return params.y;
        }
        
        float getMaxAge() {
           return params.z;
        }
        
        float getWiggle() {
           return params.w;
        }
        
        vec4 getPosition( in float age ) {
           return modelViewMatrix * vec4( position, 1.0 );
        }
        
        vec3 getVelocity( in float age ) {
           return velocity * age;
        }
        
        vec3 getAcceleration( in float age ) {
           return acceleration.xyz * age;
        }
        
        #ifdef SHOULD_ROTATE_PARTICLES
           mat4 getRotationMatrix( in vec3 axis, in float angle) {
               axis = normalize(axis);
               float s = sin(angle);
               float c = cos(angle);
               float oc = 1.0 - c;
        
               return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                           oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                           oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                           0.0,                                0.0,                                0.0,                                1.0);
           }
        
           vec3 getRotation( in vec3 pos, in float positionInTime ) {
              if( rotation.y == 0.0 ) {
                   return pos;
              }
        
              vec3 axis = unpackRotationAxis( rotation.x );
              vec3 center = rotationCenter;
              vec3 translated;
              mat4 rotationMatrix;
              float angle = 0.0;
              angle += when_eq( rotation.z, 0.0 ) * rotation.y;
              angle += when_gt( rotation.z, 0.0 ) * mix( 0.0, rotation.y, positionInTime );
              translated = rotationCenter - pos;
              rotationMatrix = getRotationMatrix( axis, angle );
              return center - vec3( rotationMatrix * vec4( translated, 0.0 ) );
           }
        #endif
        
        void main() {
            highp float age = getAge();
            highp float alive = getAlive();
            highp float maxAge = getMaxAge();
            highp float positionInTime = (age / maxAge);
            highp float isAlive = when_gt( alive, 0.0 );
            #ifdef SHOULD_WIGGLE_PARTICLES
                float wiggleAmount = positionInTime * getWiggle();
                float wiggleSin = isAlive * sin( wiggleAmount );
                float wiggleCos = isAlive * cos( wiggleAmount );
            #endif
            vec3 vel = getVelocity( age );
            vec3 accel = getAcceleration( age );
            vec3 force = vec3( 0.0 );
            vec3 pos = vec3( position );
            float drag = 1.0 - (positionInTime * 0.5) * acceleration.w;
            force += vel;
            force *= drag;
            force += accel * age;
            pos += force;
            
            #ifdef SHOULD_WIGGLE_PARTICLES
                pos.x += wiggleSin;
                pos.y += wiggleCos;
                pos.z += wiggleSin;
            #endif
            
            #ifdef SHOULD_ROTATE_PARTICLES
                pos = getRotation( pos, positionInTime );
            #endif
            
            vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
            highp float pointSize = getFloatOverLifetime( positionInTime, size ) * isAlive;
            
            #ifdef HAS_PERSPECTIVE
                float perspective = scale / length( mvPosition.xyz );
            #else
                float perspective = 1.0;
            #endif
            
            float pointSizePerspective = pointSize * perspective;
            
            #ifdef COLORIZE
               vec3 c = isAlive * getColorOverLifetime(
                   positionInTime,
                   unpackColor( color.x ),
                   unpackColor( color.y ),
                   unpackColor( color.z ),
                   unpackColor( color.w )
               );
            #else
               vec3 c = vec3(1.0);
            #endif
            
            float o = isAlive * getFloatOverLifetime( positionInTime, opacity );
            vColor = vec4( c, o );
            
            #ifdef SHOULD_ROTATE_TEXTURE
                vAngle = isAlive * getFloatOverLifetime( positionInTime, angle );
            #endif
            
            #ifdef SHOULD_CALCULATE_SPRITE
                float framesX = textureAnimation.x;
                float framesY = textureAnimation.y;
                float loopCount = textureAnimation.w;
                float totalFrames = textureAnimation.z;
                float frameNumber = mod( (positionInTime * loopCount) * totalFrames, totalFrames );
                float column = floor(mod( frameNumber, framesX ));
                float row = floor( (frameNumber - column) / framesX );
                float columnNorm = column / framesX;
                float rowNorm = row / framesY;
                vSpriteSheet.x = 1.0 / framesX;
                vSpriteSheet.y = 1.0 / framesY;
                vSpriteSheet.z = columnNorm;
                vSpriteSheet.w = rowNorm;
            #endif
            
            gl_PointSize = pointSizePerspective;
            gl_Position = projectionMatrix * mvPosition;
            
            #ifdef USE_LOGDEPTHBUF
            #ifdef USE_LOGDEPTHBUF_EXT
                vFragDepth = 1.0 + gl_Position.w;
                vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
            #else
                if ( isPerspectiveMatrix( projectionMatrix ) ) {
                    gl_Position.z = log2( max( EPSILON, gl_Position.w + 1.0 ) ) * logDepthBufFC - 1.0;
                    gl_Position.z *= gl_Position.w;
                }
            #endif
            #endif
            
            #ifdef USE_FOG
                vFogDepth = - mvPosition.z;
            #endif
        }
    `,
    fragment: /* glsl */`
        uniform float deltaTime;
        uniform float runTime;
        uniform sampler2D tex;
        uniform vec4 textureAnimation;
        uniform float scale;
        
        #define PI 3.141592653589793
        #define PI2 6.283185307179586
        #define PI_HALF 1.5707963267948966
        #define RECIPROCAL_PI 0.3183098861837907
        #define RECIPROCAL_PI2 0.15915494309189535
        #define EPSILON 1e-6
        
        #ifndef saturate
        #define saturate( a ) clamp( a, 0.0, 1.0 )
        #endif
        
        #define whiteComplement( a ) ( 1.0 - saturate( a ) )
        float pow2( const in float x ) { return x*x; }
        vec3 pow2( const in vec3 x ) { return x*x; }
        float pow3( const in float x ) { return x*x*x; }
        float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
        float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
        float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
        
        highp float rand( const in vec2 uv ) {
            const highp float a = 12.9898, b = 78.233, c = 43758.5453;
            highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
            return fract( sin( sn ) * c );
        }
        
        #ifdef HIGH_PRECISION
            float precisionSafeLength( vec3 v ) { return length( v ); }
        #else
            float precisionSafeLength( vec3 v ) {
            float maxComponent = max3( abs( v ) );
                return length( v / maxComponent ) * maxComponent;
            }
        #endif
        
        struct IncidentLight {
            vec3 color;
            vec3 direction;
            bool visible;
        };
        
        struct ReflectedLight {
            vec3 directDiffuse;
            vec3 directSpecular;
            vec3 indirectDiffuse;
            vec3 indirectSpecular;
        };
        
        struct GeometricContext {
            vec3 position;
            vec3 normal;
            vec3 viewDir;
            
            #ifdef USE_CLEARCOAT
                vec3 clearcoatNormal;
            #endif
        };
        
        vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
            return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
        }
        
        vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
            return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
        }
        
        mat3 transposeMat3( const in mat3 m ) {
            mat3 tmp;
            tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
            tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
            tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
            return tmp;
        }
        
        float luminance( const in vec3 rgb ) {
            const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );
            return dot( weights, rgb );
        }
        
        bool isPerspectiveMatrix( mat4 m ) {
            return m[ 2 ][ 3 ] == - 1.0;
        }
        
        vec2 equirectUv( in vec3 dir ) {
            float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
            float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
            return vec2( u, v );
        }
        
        float w0( float a ) {
            return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
        }
        
        float w1( float a ) {
            return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
        }
        
        float w2( float a ){
            return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
        }
        
        float w3( float a ) {
            return ( 1.0 / 6.0 ) * ( a * a * a );
        }
        
        float g0( float a ) {
            return w0( a ) + w1( a );
        }
        
        float g1( float a ) {
            return w2( a ) + w3( a );
        }
        
        float h0( float a ) {
            return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
        }
        
        float h1( float a ) {
            return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
        }
        
        vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, vec2 fullSize, float lod ) {
            uv = uv * texelSize.zw + 0.5;
            vec2 iuv = floor( uv );
            vec2 fuv = fract( uv );
            float g0x = g0( fuv.x );
            float g1x = g1( fuv.x );
            float h0x = h0( fuv.x );
            float h1x = h1( fuv.x );
            float h0y = h0( fuv.y );
            float h1y = h1( fuv.y );
            vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
            vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
            vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
            vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
            
            vec2 lodFudge = pow( 1.95, lod ) / fullSize;
            
            return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
                g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
        }
        
        vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
        vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
        vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
        vec2 fLodSizeInv = 1.0 / fLodSize;
        vec2 cLodSizeInv = 1.0 / cLodSize;
        vec2 fullSize = vec2( textureSize( sampler, 0 ) );
        vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), fullSize, floor( lod ) );
        
        vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), fullSize, ceil( lod ) );
            return mix( fSample, cSample, fract( lod ) );
        }
        
        #ifdef USE_FOG
            uniform vec3 fogColor;
            varying float vFogDepth;
        #ifdef FOG_EXP2
            uniform float fogDensity;
        #else
            uniform float fogNear;
            uniform float fogFar;
        #endif
        #endif
        
        #if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
            uniform float logDepthBufFC;
            varying float vFragDepth;
            varying float vIsPerspective;
        #endif
        
        varying vec4 vColor;
        
        #ifdef SHOULD_ROTATE_TEXTURE
            varying float vAngle;
        #endif
        
        #ifdef SHOULD_CALCULATE_SPRITE
            varying vec4 vSpriteSheet;
        #endif
        
        float when_gt(float x, float y) {
            return max(sign(x - y), 0.0);
        }
        
        float when_lt(float x, float y) {
            return min( max(1.0 - sign(x - y), 0.0), 1.0 );
        }
        
        float when_eq( float x, float y ) {
            return 1.0 - abs( sign( x - y ) );
        }
        
        float when_ge(float x, float y) {
          return 1.0 - when_lt(x, y);
        }
        
        float when_le(float x, float y) {
          return 1.0 - when_gt(x, y);
        }
        
        float and(float a, float b) {
            return a * b;
        }
        
        float or(float a, float b) {
            return min(a + b, 1.0);
        }
        
        void main() {
            vec3 outgoingLight = vColor.xyz;
            
            #ifdef ALPHATEST
               if ( vColor.w < float(ALPHATEST) ) discard;
            #endif
            
            vec2 vUv = vec2( gl_PointCoord.x, 1.0 - gl_PointCoord.y );
        
            #ifdef SHOULD_ROTATE_TEXTURE
               float x = gl_PointCoord.x - 0.5;
               float y = 1.0 - gl_PointCoord.y - 0.5;
               float c = cos( -vAngle );
               float s = sin( -vAngle );
               vUv = vec2( c * x + s * y + 0.5, c * y - s * x + 0.5 );
            #endif
        
            #ifdef SHOULD_CALCULATE_SPRITE
                float framesX = vSpriteSheet.x;
                float framesY = vSpriteSheet.y;
                float columnNorm = vSpriteSheet.z;
                float rowNorm = vSpriteSheet.w;
                vUv.x = gl_PointCoord.x * framesX + columnNorm;
                vUv.y = 1.0 - (gl_PointCoord.y * framesY + rowNorm);
            #endif
        
            vec4 rotatedTexture = texture2D( tex, vUv );
            
            #if defined( USE_LOGDEPTHBUF ) && defined( USE_LOGDEPTHBUF_EXT )
                gl_FragDepthEXT = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
            #endif
            
            outgoingLight = vColor.xyz * rotatedTexture.xyz;
            
            gl_FragColor = vec4( outgoingLight.xyz, rotatedTexture.w * vColor.w );
            
            #ifdef USE_FOG
                #ifdef FOG_EXP2
                    float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
                #else
                    float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
                #endif
                
                gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
            #endif
        }
    `,
}
