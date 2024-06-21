import { Pass, Effect, RenderPass, Selection, NormalPass } from 'postprocessing'
import { DataTexture, RGBAFormat, FloatType, ShaderChunk, ShaderLib, UniformsUtils, WebGLMultipleRenderTargets, ShaderMaterial, GLSL3, NoBlending, Uniform, Vector2, Matrix4, Vector3, Clock, Quaternion, LinearFilter, HalfFloatType, FramebufferTexture, TextureLoader, NearestFilter, RepeatWrapping, NoColorSpace, WebGLRenderTarget, ClampToEdgeWrapping, LinearMipMapLinearFilter, EquirectangularReflectionMapping, Color, Matrix3, TangentSpaceNormalMap, RedFormat, Source, Texture, NoToneMapping, PerspectiveCamera, SRGBColorSpace, DepthTexture } from 'three'
import _classPrivateFieldLooseBase from '@babel/runtime/helpers/esm/classPrivateFieldLooseBase'
import _classPrivateFieldLooseKey from '@babel/runtime/helpers/esm/classPrivateFieldLooseKey'

const getVisibleChildren = (object) => {
  const queue = [object]
  const objects = []

  while (queue.length !== 0) {
    const mesh = queue.shift()
    if (mesh.material) objects.push(mesh)

    for (const c of mesh.children) {
      if (c.visible) queue.push(c)
    }
  }

  return objects
}
const keepMaterialMapUpdated = (mrtMaterial, originalMaterial, prop, define, useKey) => {
  if (useKey) {
    if (originalMaterial[prop] !== mrtMaterial[prop]) {
      mrtMaterial[prop] = originalMaterial[prop]
      mrtMaterial.uniforms[prop].value = originalMaterial[prop]

      if (originalMaterial[prop]) {
        mrtMaterial.defines[define] = ''
      } else {
        delete mrtMaterial.defines[define]
      }

      mrtMaterial.needsUpdate = true
    }
  } else if (mrtMaterial[prop] !== undefined) {
    mrtMaterial[prop] = undefined
    mrtMaterial.uniforms[prop].value = undefined
    delete mrtMaterial.defines[define]
    mrtMaterial.needsUpdate = true
  }
}
const getMaxMipLevel = (texture) => {
  const { width, height } = texture.image
  return Math.floor(Math.log2(Math.max(width, height))) + 1
}
const saveBoneTexture = (object) => {
  let boneTexture = object.material.uniforms.prevBoneTexture.value

  if (boneTexture && boneTexture.image.width === object.skeleton.boneTexture.width) {
    boneTexture = object.material.uniforms.prevBoneTexture.value
    boneTexture.image.data.set(object.skeleton.boneTexture.image.data)
  } else {
    var _boneTexture

    ;(_boneTexture = boneTexture) == null ? void 0 : _boneTexture.dispose()
    const boneMatrices = object.skeleton.boneTexture.image.data.slice()
    const size = object.skeleton.boneTexture.image.width
    boneTexture = new DataTexture(boneMatrices, size, size, RGBAFormat, FloatType)
    object.material.uniforms.prevBoneTexture.value = boneTexture
    boneTexture.needsUpdate = true
  }
}
const updateVelocityDepthNormalMaterialBeforeRender = (c, camera) => {
  var _c$skeleton

  if ((_c$skeleton = c.skeleton) != null && _c$skeleton.boneTexture) {
    c.material.uniforms.boneTexture.value = c.skeleton.boneTexture

    if (!('USE_SKINNING' in c.material.defines)) {
      c.material.defines.USE_SKINNING = ''
      c.material.defines.BONE_TEXTURE = ''
      c.material.needsUpdate = true
    }
  }

  c.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, c.matrixWorld)
  c.material.uniforms.velocityMatrix.value.multiplyMatrices(camera.projectionMatrix, c.modelViewMatrix)
}
const updateVelocityDepthNormalMaterialAfterRender = (c, camera) => {
  var _c$skeleton2

  c.material.uniforms.prevVelocityMatrix.value.multiplyMatrices(camera.projectionMatrix, c.modelViewMatrix)
  if ((_c$skeleton2 = c.skeleton) != null && _c$skeleton2.boneTexture) saveBoneTexture(c)
}
const createGlobalDisableIblRadianceUniform = () => {
  if (!ShaderChunk.envmap_physical_pars_fragment.includes('iblRadianceDisabled')) {
    ShaderChunk.envmap_physical_pars_fragment = ShaderChunk.envmap_physical_pars_fragment.replace(
      'vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {',
      /* glsl */
      `
		uniform bool iblRadianceDisabled;
	
		vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		 if(iblRadianceDisabled) return vec3(0.);
		`
    )
  }

  if ('iblRadianceDisabled' in ShaderLib.physical.uniforms) return ShaderLib.physical.uniforms['iblRadianceDisabled']
  const globalIblRadianceDisabledUniform = {
    value: false
  }
  ShaderLib.physical.uniforms.iblRadianceDisabled = globalIblRadianceDisabledUniform
  const { clone } = UniformsUtils

  UniformsUtils.clone = (uniforms) => {
    const result = clone(uniforms)

    if ('iblRadianceDisabled' in uniforms) {
      result.iblRadianceDisabled = globalIblRadianceDisabledUniform
    }

    return result
  }

  return globalIblRadianceDisabledUniform
}
const createGlobalDisableIblIradianceUniform = () => {
  if (!ShaderChunk.envmap_physical_pars_fragment.includes('iblIrradianceDisabled')) {
    ShaderChunk.envmap_physical_pars_fragment = ShaderChunk.envmap_physical_pars_fragment.replace(
      'vec3 getIBLIrradiance( const in vec3 normal ) {',
      /* glsl */
      `
			uniform bool iblIrradianceDisabled;
		
			vec3 getIBLIrradiance( const in vec3 normal ) {
			 if(iblIrradianceDisabled) return vec3(0.);
			`
    )
  }

  if ('iblIrradianceDisabled' in ShaderLib.physical.uniforms) {
    return ShaderLib.physical.uniforms['iblIrradianceDisabled']
  }

  const globalIblIrradianceDisabledUniform = {
    value: false
  }
  ShaderLib.physical.uniforms.iblIrradianceDisabled = globalIblIrradianceDisabledUniform
  const { clone } = UniformsUtils

  UniformsUtils.clone = (uniforms) => {
    const result = clone(uniforms)

    if ('iblIrradianceDisabled' in uniforms) {
      result.iblIrradianceDisabled = globalIblIrradianceDisabledUniform
    }

    return result
  }

  return globalIblIrradianceDisabledUniform
} // source: https://github.com/mrdoob/three.js/blob/b9bc47ab1978022ab0947a9bce1b1209769b8d91/src/renderers/webgl/WebGLProgram.js#L228
// Unroll Loops

const unrollLoopPattern = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g
function unrollLoops(string) {
  return string.replace(unrollLoopPattern, loopReplacer)
}

function loopReplacer(match, start, end, snippet) {
  let string = ''

  for (let i = parseInt(start); i < parseInt(end); i++) {
    string += snippet.replace(/\[\s*i\s*\]/g, '[ ' + i + ' ]').replace(/UNROLLED_LOOP_INDEX/g, i)
  }

  return string
} //
const isGroundProjectedEnv = (c) => {
  var _c$material$fragmentS

  return (_c$material$fragmentS = c.material.fragmentShader) == null ? void 0 : _c$material$fragmentS.includes('float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );')
}
const isChildMaterialRenderable = (c, material = c.material) => {
  return material.visible && material.depthWrite && material.depthTest && (!material.transparent || material.opacity > 0) && !isGroundProjectedEnv(c)
}
const materialProps = ['vertexTangent', 'vertexColors', 'vertexAlphas', 'vertexUvs', 'uvsVertexOnly', 'supportsVertexTextures', 'instancing', 'instancingColor', 'side', 'flatShading', 'skinning', 'doubleSided', 'flipSided']
const copyNecessaryProps = (originalMaterial, newMaterial) => {
  for (const props of materialProps) newMaterial[props] = originalMaterial[props]
}

var vertexShader = '#define GLSLIFY 1\nvarying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}' // eslint-disable-line

class CopyPass extends Pass {
  constructor(textureCount = 1) {
    super('CopyPass')
    this.needsSwap = false
    this.renderTarget = new WebGLMultipleRenderTargets(1, 1, 1, {
      depthBuffer: false
    })
    this.setTextureCount(textureCount)
  }

  setTextureCount(textureCount) {
    var _this$fullscreenMater

    let definitions = ''
    let body = ''

    for (let i = 0; i < textureCount; i++) {
      definitions +=
        /* glsl */
        `
				uniform sampler2D inputTexture${i};
				layout(location = ${i}) out vec4 gOutput${i};
			`
      body +=
        /* glsl */
        `gOutput${i} = textureLod(inputTexture${i}, vUv, 0.);`
    }

    ;(_this$fullscreenMater = this.fullscreenMaterial) == null ? void 0 : _this$fullscreenMater.dispose()
    this.fullscreenMaterial = new ShaderMaterial({
      fragmentShader:
        /* glsl */
        `
            varying vec2 vUv;
			
			${definitions}

            void main() {
				${body}
            }
            `,
      vertexShader: vertexShader,
      glslVersion: GLSL3,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    })

    for (let i = 0; i < textureCount; i++) {
      this.fullscreenMaterial.uniforms['inputTexture' + i] = new Uniform(null)

      if (i >= this.renderTarget.texture.length) {
        const texture = this.renderTarget.texture[0].clone()
        texture.isRenderTargetTexture = true
        this.renderTarget.texture.push(texture)
      }
    }
  }

  setSize(width, height) {
    this.renderTarget.setSize(width, height)
  }

  render(renderer) {
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
  }
}

var fragmentShader$4 =
  '#define GLSLIFY 1\nvarying vec2 vUv;uniform sampler2D velocityTexture;uniform sampler2D depthTexture;uniform sampler2D lastVelocityTexture;uniform float blend;uniform float neighborhoodClampIntensity;uniform bool constantBlend;uniform bool fullAccumulate;uniform vec2 invTexSize;uniform float cameraNear;uniform float cameraFar;uniform mat4 projectionMatrix;uniform mat4 projectionMatrixInverse;uniform mat4 cameraMatrixWorld;uniform vec3 cameraPos;uniform vec3 prevCameraPos;uniform mat4 prevViewMatrix;uniform mat4 prevCameraMatrixWorld;uniform mat4 prevProjectionMatrix;uniform mat4 prevProjectionMatrixInverse;uniform bool reset;uniform float delta;\n#define EPSILON 0.00001\n#include <packing>\n#include <reproject>\nvoid main(){vec2 dilatedUv=vUv;getVelocityNormalDepth(dilatedUv,velocity,worldNormal,depth);if(textureCount>1&&depth==1.0){discard;return;}vec4 inputTexel[textureCount];vec4 accumulatedTexel[textureCount];bool textureSampledThisFrame[textureCount];int cnt=0;\n#pragma unroll_loop_start\nfor(int i=0;i<textureCount;i++){inputTexel[i]=textureLod(inputTexture[i],vUv,0.0);textureSampledThisFrame[i]=inputTexel[i].r>=0.;if(textureSampledThisFrame[i]){transformColor(inputTexel[i].rgb);}else{inputTexel[i].rgb=vec3(0.0);}if(cnt++==0)roughness=max(0.,inputTexel[i].a);texIndex++;}\n#pragma unroll_loop_end\ntexIndex=0;bool didMove=dot(velocity,velocity)>0.000000001;vec3 worldPos=screenSpaceToWorldSpace(dilatedUv,depth,cameraMatrixWorld,projectionMatrixInverse);flatness=getFlatness(worldPos,worldNormal);vec3 viewPos=(viewMatrix*vec4(worldPos,1.0)).xyz;vec3 viewDir=normalize(viewPos);vec3 viewNormal=(viewMatrix*vec4(worldNormal,0.0)).xyz;viewAngle=dot(-viewDir,viewNormal);vec2 reprojectedUvDiffuse=vec2(-10.0);vec2 reprojectedUvSpecular[textureCount];bool didReproject;bool reprojectHitPoint;float rayLength;\n#pragma unroll_loop_start\nfor(int i=0;i<textureCount;i++){rayLength=inputTexel[i].a;reprojectHitPoint=reprojectSpecular[i]&&rayLength>0.0;if(reprojectHitPoint){reprojectedUvSpecular[i]=getReprojectedUV(depth,worldPos,worldNormal,rayLength);}else{reprojectedUvSpecular[i]=vec2(-1.0);}reprojectedUvDiffuse=getReprojectedUV(depth,worldPos,worldNormal,0.0);didReproject=reprojectedUvSpecular[i].x>=0.0||reprojectedUvDiffuse.x>=0.0;if(!didReproject){accumulatedTexel[i]=vec4(inputTexel[i].rgb,0.0);\n#ifdef VISUALIZE_DISOCCLUSIONS\naccumulatedTexel[i]=vec4(vec3(0.,1.,0.),0.0);inputTexel[i].rgb=accumulatedTexel[i].rgb;\n#endif\n}else{if(reprojectHitPoint&&reprojectedUvSpecular[i].x>=0.0){accumulatedTexel[i]=sampleReprojectedTexture(accumulatedTexture[i],reprojectedUvSpecular[i]);}else{accumulatedTexel[i]=sampleReprojectedTexture(accumulatedTexture[i],reprojectedUvDiffuse);}\n#ifdef VISUALIZE_DISOCCLUSIONS\naccumulatedTexel[i].rgb=vec3(0.);inputTexel[i].rgb=vec3(0.);\n#endif\ntransformColor(accumulatedTexel[i].rgb);if(textureSampledThisFrame[i]){accumulatedTexel[i].a++;if(neighborhoodClamp[i]&&didMove){vec3 clampedColor=accumulatedTexel[i].rgb;clampNeighborhood(inputTexture[i],clampedColor,inputTexel[i].rgb,neighborhoodClampRadius);accumulatedTexel[i].rgb=mix(accumulatedTexel[i].rgb,clampedColor,neighborhoodClampIntensity);}}else{inputTexel[i].rgb=accumulatedTexel[i].rgb;}}texIndex++;}\n#pragma unroll_loop_end\ntexIndex=0;float maxValue=(fullAccumulate&&!didMove)? 1.0 : blend;vec3 outputColor;float temporalReprojectMix;\n#pragma unroll_loop_start\nfor(int i=0;i<textureCount;i++){if(constantBlend){temporalReprojectMix=accumulatedTexel[i].a==0.0 ? 0.0 : blend;}else{temporalReprojectMix=blend;if(accumulatedTexel[i].a>5.)accumulatedTexel[i].a=mix(accumulatedTexel[i].a,5.,angleMix);if(reset)accumulatedTexel[i].a=0.0;temporalReprojectMix=min(1.-1./(accumulatedTexel[i].a+1.0),maxValue);}outputColor=mix(inputTexel[i].rgb,accumulatedTexel[i].rgb,temporalReprojectMix);accumulatedTexel[i].a=1./(1.-temporalReprojectMix)-1.;undoColorTransform(outputColor);gOutput[i]=vec4(outputColor,accumulatedTexel[i].a);texIndex++;}\n#pragma unroll_loop_end\n#ifdef useTemporalReprojectCustomComposeShader\ntemporalReprojectCustomComposeShader\n#endif\n}' // eslint-disable-line

var reproject =
  '#define GLSLIFY 1\nvec2 dilatedUv;int texIndex;vec2 velocity;vec3 worldNormal;float depth;float flatness;vec3 debugVec3;float viewAngle;float angleMix;float roughness=0.0;\n#define luminance(a) dot(vec3(0.2125, 0.7154, 0.0721), a)\nfloat getViewZ(const float depth){return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);}vec3 screenSpaceToWorldSpace(const vec2 uv,const float depth,mat4 curMatrixWorld,const mat4 projMatrixInverse){vec4 ndc=vec4((uv.x-0.5)*2.0,(uv.y-0.5)*2.0,(depth-0.5)*2.0,1.0);vec4 clip=projMatrixInverse*ndc;vec4 view=curMatrixWorld*(clip/clip.w);return view.xyz;}vec2 viewSpaceToScreenSpace(const vec3 position,const mat4 projMatrix){vec4 projectedCoord=projMatrix*vec4(position,1.0);projectedCoord.xy/=projectedCoord.w;projectedCoord.xy=projectedCoord.xy*0.5+0.5;return projectedCoord.xy;}vec2 OctWrap(vec2 v){vec2 w=1.0-abs(v.yx);if(v.x<0.0)w.x=-w.x;if(v.y<0.0)w.y=-w.y;return w;}vec3 decodeOctWrap(vec2 f){f=f*2.0-1.0;vec3 n=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-n.z,0.0);n.x+=n.x>=0.0 ?-t : t;n.y+=n.y>=0.0 ?-t : t;return normalize(n);}vec3 unpackNormal(float packedNormal){return decodeOctWrap(unpackHalf2x16(floatBitsToUint(packedNormal)));}\n#ifdef logTransform\nvoid transformColor(inout vec3 color){color=log(color+1.);}void undoColorTransform(inout vec3 color){color=exp(color)-1.;}\n#else\n#define transformColor\n#define undoColorTransform\n#endif\nvoid getNeighborhoodAABB(const sampler2D tex,const int clampRadius,inout vec3 minNeighborColor,inout vec3 maxNeighborColor){for(int x=-clampRadius;x<=clampRadius;x++){for(int y=-clampRadius;y<=clampRadius;y++){if(x!=0||y!=0){vec2 offset=vec2(x,y)*invTexSize;vec2 neighborUv=vUv+offset;vec4 neighborTexel=textureLod(tex,neighborUv,0.0);transformColor(neighborTexel.rgb);minNeighborColor=min(neighborTexel.rgb,minNeighborColor);maxNeighborColor=max(neighborTexel.rgb,maxNeighborColor);}}}}void clampNeighborhood(const sampler2D tex,inout vec3 color,const vec3 inputColor,const int clampRadius){vec3 minNeighborColor=inputColor;vec3 maxNeighborColor=inputColor;getNeighborhoodAABB(tex,clampRadius,minNeighborColor,maxNeighborColor);color=clamp(color,minNeighborColor,maxNeighborColor);}void getVelocityNormalDepth(inout vec2 dilatedUv,out vec2 vel,out vec3 normal,out float depth){vec2 centerUv=dilatedUv;\n#ifdef dilation\nfloat closestDepth=0.0;vec4 closestVelocityTexel=vec4(0.0);for(int x=-1;x<=1;x++){for(int y=-1;y<=1;y++){vec2 offset=vec2(x,y)*invTexSize;vec2 neighborUv=centerUv+offset;vec4 velocityTexel=textureLod(velocityTexture,neighborUv,0.0);float neighborDepth=velocityTexel.a;if(x==0&&y==0){vel=velocityTexel.rg;}if(neighborDepth>closestDepth){closestDepth=neighborDepth;closestVelocityTexel=velocityTexel;dilatedUv=neighborUv;}}}normal=unpackNormal(closestVelocityTexel.b);depth=closestDepth;\n#else\nvec4 velocityTexel=textureLod(velocityTexture,centerUv,0.0);vel=velocityTexel.rg;normal=unpackNormal(velocityTexel.b);depth=velocityTexel.a;\n#endif\n}\n#define PLANE_DISTANCE 1.0\n#define NORMAL_DISTANCE 0.1\n#define VELOCITY_DISTANCE 0.005\nbool planeDistanceDisocclusionCheck(const vec3 worldPos,const vec3 lastWorldPos,const vec3 worldNormal,const float distFactor){if(abs(dot(worldNormal,worldPos))==0.0)return false;vec3 toCurrent=worldPos-lastWorldPos;float distToPlane=abs(dot(toCurrent,worldNormal));return distToPlane>PLANE_DISTANCE*distFactor;}bool normalDisocclusionCheck(vec3 worldNormal,vec3 lastWorldNormal,const float distFactor){return pow(abs(dot(worldNormal,lastWorldNormal)),2.)<NORMAL_DISTANCE*distFactor;}bool velocityDisocclusionCheck(const vec2 velocity,const vec2 lastVelocity,const float distFactor){return length(velocity-lastVelocity)>VELOCITY_DISTANCE*distFactor;}bool validateReprojectedUV(const vec2 reprojectedUv,const vec3 worldPos,const vec3 worldNormal,const bool isHitPoint){if(reprojectedUv.x>1.0||reprojectedUv.x<0.0||reprojectedUv.y>1.0||reprojectedUv.y<0.0)return false;vec2 dilatedReprojectedUv=reprojectedUv;vec2 lastVelocity=vec2(0.0);vec3 lastWorldNormal=vec3(0.0);float lastDepth=0.0;getVelocityNormalDepth(dilatedReprojectedUv,lastVelocity,lastWorldNormal,lastDepth);vec3 lastWorldPos=screenSpaceToWorldSpace(dilatedReprojectedUv,lastDepth,prevCameraMatrixWorld,prevProjectionMatrixInverse);vec3 lastViewPos=(viewMatrix*vec4(lastWorldPos,1.0)).xyz;vec3 lastViewDir=normalize(lastViewPos);vec3 lastViewNormal=(viewMatrix*vec4(lastWorldNormal,0.0)).xyz;float lastViewAngle=dot(-lastViewDir,lastViewNormal);float angleDiff=max(0.,abs(lastViewAngle-viewAngle));angleMix=min(1.,2.*angleDiff);float viewZ=abs(getViewZ(depth));float distFactor=1.+1./(viewZ+1.0);if(velocityDisocclusionCheck(velocity,lastVelocity,distFactor))return false;if(planeDistanceDisocclusionCheck(worldPos,lastWorldPos,worldNormal,distFactor))return false;return true;}vec2 reprojectHitPoint(const vec3 rayOrig,const float rayLength){if(roughness>0.4||rayLength>10.0e3){return vUv-velocity;}vec3 cameraRay=rayOrig-cameraPos;cameraRay=normalize(cameraRay);vec3 parallaxHitPoint=cameraPos+cameraRay*rayLength;vec4 reprojectedHitPoint=prevProjectionMatrix*prevViewMatrix*vec4(parallaxHitPoint,1.0);reprojectedHitPoint.xyz/=reprojectedHitPoint.w;reprojectedHitPoint.xy=reprojectedHitPoint.xy*0.5+0.5;return reprojectedHitPoint.xy;}vec2 getReprojectedUV(const float depth,const vec3 worldPos,const vec3 worldNormal,const float rayLength){if(rayLength!=0.0){vec2 reprojectedUv=reprojectHitPoint(worldPos,rayLength);if(validateReprojectedUV(reprojectedUv,worldPos,worldNormal,true)){return reprojectedUv;}return vec2(-1.);}vec2 reprojectedUv=vUv-velocity;if(validateReprojectedUV(reprojectedUv,worldPos,worldNormal,false)){return reprojectedUv;}return vec2(-1.);}vec4 SampleTextureCatmullRom(const sampler2D tex,const vec2 uv,const vec2 texSize){vec2 samplePos=uv*texSize;vec2 texPos1=floor(samplePos-0.5f)+0.5f;vec2 f=samplePos-texPos1;vec2 w0=f*(-0.5f+f*(1.0f-0.5f*f));vec2 w1=1.0f+f*f*(-2.5f+1.5f*f);vec2 w2=f*(0.5f+f*(2.0f-1.5f*f));vec2 w3=f*f*(-0.5f+0.5f*f);vec2 w12=w1+w2;vec2 offset12=w2/(w1+w2);vec2 texPos0=texPos1-1.;vec2 texPos3=texPos1+2.;vec2 texPos12=texPos1+offset12;texPos0/=texSize;texPos3/=texSize;texPos12/=texSize;vec4 result=vec4(0.0);result+=textureLod(tex,vec2(texPos0.x,texPos0.y),0.0f)*w0.x*w0.y;result+=textureLod(tex,vec2(texPos12.x,texPos0.y),0.0f)*w12.x*w0.y;result+=textureLod(tex,vec2(texPos3.x,texPos0.y),0.0f)*w3.x*w0.y;result+=textureLod(tex,vec2(texPos0.x,texPos12.y),0.0f)*w0.x*w12.y;result+=textureLod(tex,vec2(texPos12.x,texPos12.y),0.0f)*w12.x*w12.y;result+=textureLod(tex,vec2(texPos3.x,texPos12.y),0.0f)*w3.x*w12.y;result+=textureLod(tex,vec2(texPos0.x,texPos3.y),0.0f)*w0.x*w3.y;result+=textureLod(tex,vec2(texPos12.x,texPos3.y),0.0f)*w12.x*w3.y;result+=textureLod(tex,vec2(texPos3.x,texPos3.y),0.0f)*w3.x*w3.y;result=max(result,vec4(0.));return result;}float getFlatness(vec3 g,vec3 rp){vec3 gw=fwidth(g);vec3 pw=fwidth(rp);float wfcurvature=length(gw)/length(pw);wfcurvature=smoothstep(0.0,30.,wfcurvature);return clamp(wfcurvature,0.,1.);}vec2 sampleBlocky(vec2 p){p/=invTexSize;vec2 seam=floor(p+0.5);p=seam+clamp((p-seam)/fwidth(p),-0.5,0.5);return p*invTexSize;}vec4 sampleReprojectedTexture(const sampler2D tex,const vec2 reprojectedUv){vec4 blocky=SampleTextureCatmullRom(tex,(reprojectedUv),1./invTexSize);return blocky;}' // eslint-disable-line

class TemporalReprojectMaterial extends ShaderMaterial {
  constructor(textureCount = 1, temporalReprojectCustomComposeShader = '') {
    let finalFragmentShader = fragmentShader$4.replace('#include <reproject>', reproject)

    if (typeof temporalReprojectCustomComposeShader === 'string') {
      finalFragmentShader = finalFragmentShader.replace('temporalReprojectCustomComposeShader', temporalReprojectCustomComposeShader)
    }

    let definitions = ''

    for (let i = 0; i < textureCount; i++) {
      definitions +=
        /* glsl */
        `
				uniform sampler2D inputTexture${i};
				uniform sampler2D accumulatedTexture${i};

				layout(location = ${i}) out vec4 gOutput${i};
			`
    }

    finalFragmentShader = definitions + finalFragmentShader.replaceAll('textureCount', textureCount)
    finalFragmentShader = unrollLoops(finalFragmentShader)
    const matches = finalFragmentShader.matchAll(/inputTexture\[\s*[0-9]+\s*]/g)

    for (const [key] of matches) {
      const number = key.replace(/[^0-9]/g, '')
      finalFragmentShader = finalFragmentShader.replace(key, 'inputTexture' + number)
    }

    const matches2 = finalFragmentShader.matchAll(/accumulatedTexture\[\s*[0-9]+\s*]/g)

    for (const [key] of matches2) {
      const number = key.replace(/[^0-9]/g, '')
      finalFragmentShader = finalFragmentShader.replace(key, 'accumulatedTexture' + number)
    }

    const matches3 = finalFragmentShader.matchAll(/gOutput\[\s*[0-9]+\s*]/g)

    for (const [key] of matches3) {
      const number = key.replace(/[^0-9]/g, '')
      finalFragmentShader = finalFragmentShader.replace(key, 'gOutput' + number)
    }

    super({
      type: 'TemporalReprojectMaterial',
      uniforms: {
        velocityTexture: new Uniform(null),
        depthTexture: new Uniform(null),
        lastVelocityTexture: new Uniform(null),
        blend: new Uniform(0),
        neighborhoodClampIntensity: new Uniform(0),
        constantBlend: new Uniform(false),
        fullAccumulate: new Uniform(false),
        reset: new Uniform(false),
        delta: new Uniform(0),
        invTexSize: new Uniform(new Vector2()),
        projectionMatrix: new Uniform(new Matrix4()),
        projectionMatrixInverse: new Uniform(new Matrix4()),
        cameraMatrixWorld: new Uniform(new Matrix4()),
        viewMatrix: new Uniform(new Matrix4()),
        prevViewMatrix: new Uniform(new Matrix4()),
        prevCameraMatrixWorld: new Uniform(new Matrix4()),
        prevProjectionMatrix: new Uniform(new Matrix4()),
        prevProjectionMatrixInverse: new Uniform(new Matrix4()),
        cameraPos: new Uniform(new Vector3()),
        prevCameraPos: new Uniform(new Vector3()),
        cameraNear: new Uniform(0),
        cameraFar: new Uniform(0)
      },
      vertexShader,
      fragmentShader: finalFragmentShader,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      glslVersion: GLSL3
    })

    for (let i = 0; i < textureCount; i++) {
      this.uniforms['inputTexture' + i] = new Uniform(null)
      this.uniforms['accumulatedTexture' + i] = new Uniform(null)
    }

    if (typeof temporalReprojectCustomComposeShader === 'string') {
      this.defines.useTemporalReprojectCustomComposeShader = ''
    }
  }
}

// from: https://news.ycombinator.com/item?id=17876741

const g = 1.32471795724474602596090885447809 // Plastic number

const a1 = 1.0 / g
const a2 = 1.0 / (g * g)
const base = 1.1127756842787055 // harmoniousNumber(7), yields better coverage compared to using 0.5

const generateR2 = (count) => {
  const points = []

  for (let n = 0; n < count; n++) {
    points.push([(base + a1 * n) % 1, (base + a2 * n) % 1])
  }

  return points
}

const defaultTemporalReprojectPassOptions = {
  blend: 0.9,
  dilation: false,
  constantBlend: false,
  fullAccumulate: false,
  neighborhoodClamp: false,
  neighborhoodClampRadius: 1,
  neighborhoodClampIntensity: 1,
  logTransform: false,
  depthDistance: 2,
  worldDistance: 4,
  reprojectSpecular: false,
  temporalReprojectCustomComposeShader: null,
  renderTarget: null
}
const tmpProjectionMatrix$1 = new Matrix4()
const tmpProjectionMatrixInverse$1 = new Matrix4()
const tmpVec2 = new Vector2()
class TemporalReprojectPass extends Pass {
  constructor(scene, camera, velocityDepthNormalPass, textureCount = 1, options = defaultTemporalReprojectPassOptions) {
    super('TemporalReprojectPass')
    this.needsSwap = false
    this.overrideAccumulatedTextures = []
    this.clock = new Clock()
    this.r2Sequence = []
    this.pointsIndex = 0
    this.lastCameraTransform = {
      position: new Vector3(),
      quaternion: new Quaternion()
    }
    this._scene = scene
    this._camera = camera
    this.textureCount = textureCount
    options = { ...defaultTemporalReprojectPassOptions, ...options }
    this.renderTarget = new WebGLMultipleRenderTargets(1, 1, textureCount, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      type: HalfFloatType,
      depthBuffer: false
    })
    this.renderTarget.texture.forEach((texture, index) => (texture.name = 'TemporalReprojectPass.accumulatedTexture' + index))
    this.fullscreenMaterial = new TemporalReprojectMaterial(textureCount, options.temporalReprojectCustomComposeShader)
    this.fullscreenMaterial.defines.textureCount = textureCount
    if (options.dilation) this.fullscreenMaterial.defines.dilation = ''
    if (options.neighborhoodClamp) this.fullscreenMaterial.defines.neighborhoodClamp = ''
    if (options.logTransform) this.fullscreenMaterial.defines.logTransform = ''
    this.fullscreenMaterial.defines.neighborhoodClampRadius = parseInt(options.neighborhoodClampRadius)
    this.fullscreenMaterial.defines.depthDistance = options.depthDistance.toPrecision(5)
    this.fullscreenMaterial.defines.worldDistance = options.worldDistance.toPrecision(5)
    this.fullscreenMaterial.uniforms.blend.value = options.blend
    this.fullscreenMaterial.uniforms.constantBlend.value = options.constantBlend
    this.fullscreenMaterial.uniforms.fullAccumulate.value = options.fullAccumulate
    this.fullscreenMaterial.uniforms.neighborhoodClampIntensity.value = options.neighborhoodClampIntensity
    this.fullscreenMaterial.uniforms.projectionMatrix.value = camera.projectionMatrix.clone()
    this.fullscreenMaterial.uniforms.projectionMatrixInverse.value = camera.projectionMatrixInverse.clone()
    this.fullscreenMaterial.uniforms.cameraMatrixWorld.value = camera.matrixWorld
    this.fullscreenMaterial.uniforms.viewMatrix.value = camera.matrixWorldInverse
    this.fullscreenMaterial.uniforms.cameraPos.value = camera.position
    this.fullscreenMaterial.uniforms.prevViewMatrix.value = camera.matrixWorldInverse.clone()
    this.fullscreenMaterial.uniforms.prevCameraMatrixWorld.value = camera.matrixWorld.clone()
    this.fullscreenMaterial.uniforms.prevProjectionMatrix.value = camera.projectionMatrix.clone()
    this.fullscreenMaterial.uniforms.prevProjectionMatrixInverse.value = camera.projectionMatrixInverse.clone() // init copy pass to save the accumulated textures and the textures from the last frame

    this.copyPass = new CopyPass(textureCount)

    for (let i = 0; i < textureCount; i++) {
      const accumulatedTexture = this.copyPass.renderTarget.texture[i]
      accumulatedTexture.type = HalfFloatType
      accumulatedTexture.minFilter = LinearFilter
      accumulatedTexture.magFilter = LinearFilter
      accumulatedTexture.needsUpdate = true
    }

    this.fullscreenMaterial.uniforms.velocityTexture.value = velocityDepthNormalPass.renderTarget.texture
    this.fullscreenMaterial.uniforms.depthTexture.value = velocityDepthNormalPass.depthTexture

    for (const opt of ['reprojectSpecular', 'neighborhoodClamp']) {
      let value = options[opt]
      if (typeof value !== 'array') value = Array(textureCount).fill(value)
      this.fullscreenMaterial.defines[opt] =
        /* glsl */
        `bool[](${value.join(', ')})`
    }

    this.options = options
    this.velocityDepthNormalPass = velocityDepthNormalPass
  }

  setTextures(textures) {
    if (!Array.isArray(textures)) textures = [textures]

    for (let i = 0; i < textures.length; i++) {
      const texture = textures[i]
      this.fullscreenMaterial.uniforms['inputTexture' + i] = new Uniform(texture)
    }
  }

  dispose() {
    super.dispose()
    this.renderTarget.dispose()
    this.copyPass.dispose()
    this.fullscreenMaterial.dispose()
  }

  setSize(width, height) {
    var _this$framebufferText

    this.renderTarget.setSize(width, height)
    this.copyPass.setSize(width, height)
    this.fullscreenMaterial.uniforms.invTexSize.value.set(1 / width, 1 / height)
    ;(_this$framebufferText = this.framebufferTexture) == null ? void 0 : _this$framebufferText.dispose()
    this.framebufferTexture = new FramebufferTexture(width, height, RGBAFormat)
    this.framebufferTexture.type = HalfFloatType
    this.framebufferTexture.minFilter = LinearFilter
    this.framebufferTexture.magFilter = LinearFilter
    this.framebufferTexture.needsUpdate = true
  }

  get texture() {
    return this.renderTarget.texture[0]
  }

  reset() {
    this.fullscreenMaterial.uniforms.reset.value = true
  }

  render(renderer) {
    const delta = Math.min(1 / 10, this.clock.getDelta())
    this.fullscreenMaterial.uniforms.delta.value = delta
    tmpProjectionMatrix$1.copy(this._camera.projectionMatrix)
    tmpProjectionMatrixInverse$1.copy(this._camera.projectionMatrixInverse)
    if (this._camera.view) this._camera.view.enabled = false

    this._camera.updateProjectionMatrix()

    this.fullscreenMaterial.uniforms.projectionMatrix.value.copy(this._camera.projectionMatrix)
    this.fullscreenMaterial.uniforms.projectionMatrixInverse.value.copy(this._camera.projectionMatrixInverse)
    this.fullscreenMaterial.uniforms.lastVelocityTexture.value = this.velocityDepthNormalPass.lastVelocityTexture
    if (this._camera.view) this._camera.view.enabled = true

    this._camera.projectionMatrix.copy(tmpProjectionMatrix$1)

    this._camera.projectionMatrixInverse.copy(tmpProjectionMatrixInverse$1)

    this.fullscreenMaterial.uniforms.cameraNear.value = this._camera.near
    this.fullscreenMaterial.uniforms.cameraFar.value = this._camera.far
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
    this.fullscreenMaterial.uniforms.reset.value = false

    for (let i = 0; i < this.textureCount; i++) {
      this.copyPass.fullscreenMaterial.uniforms['inputTexture' + i].value = this.renderTarget.texture[i]
      const copyAccumulatedTexture = this.renderTarget.texture.length > 1 ? this.copyPass.renderTarget.texture[i] : this.framebufferTexture
      const accumulatedTexture = this.overrideAccumulatedTextures.length === 0 ? copyAccumulatedTexture : this.overrideAccumulatedTextures[i]
      this.fullscreenMaterial.uniforms['accumulatedTexture' + i].value = accumulatedTexture
    }

    if (this.renderTarget.texture.length > 1) {
      this.copyPass.render(renderer)
    } else {
      renderer.copyFramebufferToTexture(tmpVec2, this.framebufferTexture)
    } // save last transformations

    this.fullscreenMaterial.uniforms.prevCameraMatrixWorld.value.copy(this._camera.matrixWorld)
    this.fullscreenMaterial.uniforms.prevViewMatrix.value.copy(this._camera.matrixWorldInverse)
    this.fullscreenMaterial.uniforms.prevProjectionMatrix.value.copy(this.fullscreenMaterial.uniforms.projectionMatrix.value)
    this.fullscreenMaterial.uniforms.prevProjectionMatrixInverse.value.copy(this.fullscreenMaterial.uniforms.projectionMatrixInverse.value)
    this.fullscreenMaterial.uniforms.prevCameraPos.value.copy(this._camera.position)
  }

  jitter(jitterScale = 1) {
    this.unjitter()
    if (this.r2Sequence.length === 0) this.r2Sequence = generateR2(256).map(([a, b]) => [a - 0.5, b - 0.5])
    this.pointsIndex = (this.pointsIndex + 1) % this.r2Sequence.length
    const [x, y] = this.r2Sequence[this.pointsIndex]
    const { width, height } = this.renderTarget

    if (this._camera.setViewOffset) {
      this._camera.setViewOffset(width, height, x * jitterScale, y * jitterScale, width, height)
    }
  }

  unjitter() {
    if (this._camera.clearViewOffset) this._camera.clearViewOffset()
  }
}

var traa_compose = '#define GLSLIFY 1\nuniform sampler2D inputTexture;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 accumulatedTexel=textureLod(inputTexture,vUv,0.);outputColor=vec4(accumulatedTexel.rgb,1.);}' // eslint-disable-line

const defaultTRAAOptions = {
  blend: 0.8,
  dilation: true,
  logTransform: true,
  neighborhoodClampRadius: 2,
  neighborhoodClamp: true
}
class TRAAEffect extends Effect {
  constructor(scene, camera, velocityDepthNormalPass, options = defaultTRAAOptions) {
    super('TRAAEffect', traa_compose, {
      type: 'FinalTRAAEffectMaterial',
      uniforms: new Map([['inputTexture', new Uniform(null)]])
    })
    this._scene = scene
    this._camera = camera
    options = { ...defaultTRAAOptions, ...options }
    this.temporalReprojectPass = new TemporalReprojectPass(scene, camera, velocityDepthNormalPass, 1, options)
    this.uniforms.get('inputTexture').value = this.temporalReprojectPass.texture
    this.setSize(options.width, options.height)
  }

  setSize(width, height) {
    this.temporalReprojectPass.setSize(width, height)
  }

  dispose() {
    super.dispose()
    this.temporalReprojectPass.dispose()
  }

  update(renderer, inputBuffer) {
    this.temporalReprojectPass.unjitter()
    this.unjitteredProjectionMatrix = this._camera.projectionMatrix.clone()

    this._camera.projectionMatrix.copy(this.unjitteredProjectionMatrix)

    const noJitterMeshes = getVisibleChildren(this._scene).filter((c) => isGroundProjectedEnv(c))

    for (const mesh of noJitterMeshes) {
      const renderData = renderer.properties.get(mesh.material)
      if (!(renderData != null && renderData.programs)) continue
      const uniforms = Array.from(renderData.programs.values())[0].getUniforms()

      if (!uniforms._patchedProjectionMatrix) {
        const oldSetValue = uniforms.setValue.bind(uniforms)
        uniforms._oldSetValue = oldSetValue

        uniforms.setValue = (gl, name, value, ...args) => {
          if (name === 'projectionMatrix') {
            value = this.unjitteredProjectionMatrix
          }

          oldSetValue(gl, name, value, ...args)
        }

        uniforms._patchedProjectionMatrix = true
      }

      cancelAnimationFrame(uniforms._destroyPatchRAF)
      cancelAnimationFrame(uniforms._destroyPatchRAF2)
      uniforms._destroyPatchRAF = requestAnimationFrame(() => {
        uniforms._destroyPatchRAF2 = requestAnimationFrame(() => {
          uniforms.setValue = uniforms._oldSetValue
          delete uniforms._oldSetValue
          delete uniforms._patchedProjectionMatrix
        })
      })
    }

    this.temporalReprojectPass.fullscreenMaterial.uniforms.inputTexture0.value = inputBuffer.texture
    this.temporalReprojectPass.jitter()
    this.temporalReprojectPass.render(renderer)
  }
}
TRAAEffect.DefaultOptions = defaultTRAAOptions

var gbuffer_packing =
  '#define GLSLIFY 1\nuniform sampler2D gBuffersTexture;float color2float(in vec3 c){c*=255.;c=floor(c);return c.r*256.*256.+c.g*256.+c.b-8388608.;}vec3 float2color(in float val){val+=8388608.;if(val<0.){return vec3(0.);}if(val>16777216.){return vec3(1.);}vec3 c=vec3(0.);c.b=mod(val,256.);val=floor(val/256.);c.g=mod(val,256.);val=floor(val/256.);c.r=mod(val,256.);return c/255.;}vec2 OctWrap(vec2 v){vec2 w=1.0-abs(v.yx);if(v.x<0.0)w.x=-w.x;if(v.y<0.0)w.y=-w.y;return w;}vec2 encodeOctWrap(vec3 n){n/=(abs(n.x)+abs(n.y)+abs(n.z));n.xy=n.z>0.0 ? n.xy : OctWrap(n.xy);n.xy=n.xy*0.5+0.5;return n.xy;}vec3 decodeOctWrap(vec2 f){f=f*2.0-1.0;vec3 n=vec3(f.x,f.y,1.0-abs(f.x)-abs(f.y));float t=max(-n.z,0.0);n.x+=n.x>=0.0 ?-t : t;n.y+=n.y>=0.0 ?-t : t;return normalize(n);}float packNormal(vec3 normal){return uintBitsToFloat(packHalf2x16(encodeOctWrap(normal)));}vec3 unpackNormal(float packedNormal){return decodeOctWrap(unpackHalf2x16(floatBitsToUint(packedNormal)));}float packVec2(vec2 value){return uintBitsToFloat(packHalf2x16(value));}vec2 unpackVec2(float packedValue){return unpackHalf2x16(floatBitsToUint(packedValue));}vec4 encodeRGBE8(vec3 rgb){vec4 vEncoded;float maxComponent=max(max(rgb.r,rgb.g),rgb.b);float fExp=ceil(log2(maxComponent));vEncoded.rgb=rgb/exp2(fExp);vEncoded.a=(fExp+128.0)/255.0;return vEncoded;}vec3 decodeRGBE8(vec4 rgbe){vec3 vDecoded;float fExp=rgbe.a*255.0-128.0;vDecoded=rgbe.rgb*exp2(fExp);return vDecoded;}float vec4tofloat(vec4 vec){uvec4 v=uvec4(vec*255.0);uint value=(v.a<<24u)|(v.b<<16u)|(v.g<<8u)|(v.r);return uintBitsToFloat(value);}vec4 floattovec4(float f){uint value=floatBitsToUint(f);vec4 v;v.r=float(value&0xFFu)/255.0;v.g=float((value>>8u)&0xFFu)/255.0;v.b=float((value>>16u)&0xFFu)/255.0;v.a=float((value>>24u)&0xFFu)/255.0;return v;}void getGDataAndGBuffer(sampler2D gBufferTexture,vec2 uv,out vec3 diffuse,out vec3 normal,out float roughness,out float metalness,out vec4 gBuffer){gBuffer=textureLod(gBufferTexture,uv,0.);diffuse=float2color(gBuffer.r);normal=unpackNormal(gBuffer.g);vec2 roughnessMetalness=unpackVec2(gBuffer.b);roughness=roughnessMetalness.r;metalness=roughnessMetalness.g;}void getGData(sampler2D gBufferTexture,vec2 uv,out vec3 diffuse,out vec3 normal,out float roughness,out float metalness,out vec3 emissive){vec4 gBuffer;getGDataAndGBuffer(gBufferTexture,uv,diffuse,normal,roughness,metalness,gBuffer);emissive=decodeRGBE8(floattovec4(gBuffer.a));}void getGData(sampler2D gBufferTexture,vec2 uv,out vec3 diffuse,out vec3 normal,out float roughness,out float metalness){vec4 gBuffer;getGDataAndGBuffer(gBufferTexture,uv,diffuse,normal,roughness,metalness,gBuffer);}vec4 packGBuffer(vec3 diffuse,vec3 normal,float roughness,float metalness,vec3 emissive){vec4 gBuffer;gBuffer.r=color2float(diffuse);gBuffer.g=packNormal(normal);gBuffer.b=packVec2(vec2(roughness,metalness));gBuffer.a=vec4tofloat(encodeRGBE8(emissive));return gBuffer;}' // eslint-disable-line

var img =
  'data:image/png;base64,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'
var blueNoiseImage = img

var sampleBlueNoise = '#define GLSLIFY 1\nconst float g=1.6180339887498948482;const float a1=1.0/g;float r1(float n){return fract(1.1127756842787055+a1*n);}const vec4 hn=vec4(0.618033988749895,0.3247179572447458,0.2207440846057596,0.1673039782614187);vec4 sampleBlueNoise(sampler2D tex,int seed,vec2 repeat,vec2 texSize){vec2 size=vUv*texSize;vec2 blueNoiseSize=texSize/repeat;float blueNoiseIndex=floor(floor(size.y/blueNoiseSize.y)*repeat.x)+floor(size.x/blueNoiseSize.x);vec2 blueNoiseUv=vUv*repeat;vec4 blueNoise=textureLod(tex,blueNoiseUv,0.);if(seed!=0){blueNoise=fract(blueNoise+hn*float(seed));blueNoise.r=(blueNoise.r>0.5 ? 1.0-blueNoise.r : blueNoise.r)*2.0;blueNoise.g=(blueNoise.g>0.5 ? 1.0-blueNoise.g : blueNoise.g)*2.0;blueNoise.b=(blueNoise.b>0.5 ? 1.0-blueNoise.b : blueNoise.b)*2.0;blueNoise.a=(blueNoise.a>0.5 ? 1.0-blueNoise.a : blueNoise.a)*2.0;}return blueNoise;}' // eslint-disable-line

var fragmentShader$3 =
  '#define GLSLIFY 1\nvarying vec2 vUv;uniform sampler2D inputTexture;uniform sampler2D inputTexture2;uniform sampler2D depthTexture;uniform mat4 projectionMatrixInverse;uniform mat4 cameraMatrixWorld;uniform float radius;uniform float phi;uniform float lumaPhi;uniform float depthPhi;uniform float normalPhi;uniform float roughnessPhi;uniform float diffusePhi;uniform sampler2D blueNoiseTexture;uniform vec2 blueNoiseRepeat;uniform int index;uniform vec2 resolution;layout(location=0)out vec4 gOutput0;layout(location=1)out vec4 gOutput1;\n#include <common>\n#include <gbuffer_packing>\n#include <sampleBlueNoise>\n#define luminance(a) dot(vec3(0.2125, 0.7154, 0.0721), a)\nvec3 getWorldPos(float depth,vec2 coord){float z=depth*2.0-1.0;vec4 clipSpacePosition=vec4(coord*2.0-1.0,z,1.0);vec4 viewSpacePosition=projectionMatrixInverse*clipSpacePosition;vec4 worldSpacePosition=cameraMatrixWorld*viewSpacePosition;worldSpacePosition.xyz/=worldSpacePosition.w;return worldSpacePosition.xyz;}float getCurvature(vec3 n,float depth){vec3 dx=dFdx(n);vec3 dy=dFdy(n);vec3 xneg=n-dx;vec3 xpos=n+dx;vec3 yneg=n-dy;vec3 ypos=n+dy;float curvature=(cross(xneg,xpos).y-cross(yneg,ypos).x)*4.0/depth;return curvature;}float distToPlane(const vec3 worldPos,const vec3 neighborWorldPos,const vec3 worldNormal){vec3 toCurrent=worldPos-neighborWorldPos;float distToPlane=abs(dot(toCurrent,worldNormal));return distToPlane;}void toDenoiseSpace(inout vec3 color){color=log(color+1.);}void toLinearSpace(inout vec3 color){color=exp(color)-1.;}float getLuminanceWeight(float luminance,float a){return mix(1./(luminance+0.01),1.,1./pow(a+1.,4.));}void evaluateNeighbor(const vec4 neighborTexel,const float neighborLuminance,inout vec3 denoised,inout float totalWeight,const float basicWeight){float w=basicWeight;w*=getLuminanceWeight(neighborLuminance,neighborTexel.a);denoised+=w*neighborTexel.rgb;totalWeight+=w;}const vec2 poissonDisk[samples]=POISSON_DISK_SAMPLES;void main(){vec4 depthTexel=textureLod(depthTexture,vUv,0.);if(depthTexel.r==1.0){discard;return;}vec4 texel=textureLod(inputTexture,vUv,0.0);vec4 texel2=textureLod(inputTexture2,vUv,0.0);float lum=luminance(texel.rgb);float lum2=luminance(texel2.rgb);float totalWeight=getLuminanceWeight(lum,texel.a);float totalWeight2=getLuminanceWeight(lum2,texel2.a);toDenoiseSpace(texel.rgb);toDenoiseSpace(texel2.rgb);vec3 denoised=texel.rgb*totalWeight;vec3 denoised2=texel2.rgb*totalWeight2;vec3 diffuse,normal,emissive;float roughness,metalness;getGData(gBuffersTexture,vUv,diffuse,normal,roughness,metalness,emissive);float depth=depthTexel.x;vec3 worldPos=getWorldPos(depth,vUv);vec4 random=sampleBlueNoise(blueNoiseTexture,index,blueNoiseRepeat,resolution);float angle=random.r*2.*PI;float s=sin(angle),c=cos(angle);mat2 rotationMatrix=mat2(c,-s,s,c);float specularWeight=roughness*roughness>0.15 ? 1. : roughness*roughness/0.15;specularWeight=pow(specularWeight*specularWeight,4.);specularWeight=1.;float a=texel.a;float a2=texel2.a;float w=smoothstep(0.,1.,1./pow(a+1.,1./2.5));float w2=smoothstep(0.,1.,1./pow(a2+1.,1./2.5));float curvature=getCurvature(normal,depth);float r=mix(radius,4.,min(1.,curvature*curvature));for(int i=0;i<samples;i++){vec2 offset=r*rotationMatrix*poissonDisk[i];vec2 neighborUv=vUv+offset;vec4 neighborTexel=textureLod(inputTexture,neighborUv,0.);vec4 neighborTexel2=textureLod(inputTexture2,neighborUv,0.);float neighborLuminance=luminance(neighborTexel.rgb);float neighborLuminance2=luminance(neighborTexel2.rgb);toDenoiseSpace(neighborTexel.rgb);toDenoiseSpace(neighborTexel2.rgb);vec3 neighborNormal,neighborDiffuse;float neighborRoughness,neighborMetalness;getGData(gBuffersTexture,neighborUv,neighborDiffuse,neighborNormal,neighborRoughness,neighborMetalness);float neighborDepth=textureLod(depthTexture,neighborUv,0.0).x;vec3 neighborWorldPos=getWorldPos(neighborDepth,neighborUv);float normalDiff=1.-max(dot(normal,neighborNormal),0.);float depthDiff=10.*distToPlane(worldPos,neighborWorldPos,normal);float roughnessDiff=abs(roughness-neighborRoughness);float diffuseDiff=length(neighborDiffuse-diffuse);float lumaDiff=mix(abs(lum-neighborLuminance),0.,w);float lumaDiff2=mix(abs(lum2-neighborLuminance2),0.,w2);float basicWeight=float(neighborDepth!=1.0)*exp(-normalDiff*normalPhi-depthDiff*depthPhi-roughnessDiff*roughnessPhi-diffuseDiff*diffusePhi);float similarity=w*pow(basicWeight,phi/w)*exp(-lumaDiff*lumaPhi);float similarity2=w2*pow(basicWeight,phi/w2)*specularWeight*exp(-lumaDiff2*lumaPhi);evaluateNeighbor(neighborTexel,neighborLuminance,denoised,totalWeight,similarity);evaluateNeighbor(neighborTexel2,neighborLuminance2,denoised2,totalWeight2,similarity2);}denoised=totalWeight>0. ? denoised/totalWeight : texel.rgb;denoised2=totalWeight2>0. ? denoised2/totalWeight2 : texel2.rgb;toLinearSpace(denoised);toLinearSpace(denoised2);\n#define FINAL_OUTPUT\ngOutput0=vec4(denoised,texel.a);gOutput1=vec4(denoised2,texel2.a);}' // eslint-disable-line

function generateDenoiseSamples(numSamples, numRings, r, texelSize) {
  r = 1
  const angleStep = (2 * Math.PI * numRings) / numSamples
  const samples = []
  let angle = 0

  for (let i = 0; i < numSamples; i++) {
    const v = new Vector2(Math.cos(angle), Math.sin(angle)).multiply(texelSize).multiplyScalar(r)
    samples.push(v)
    angle += angleStep
  }

  return samples
}
function generatePoissonDiskConstant(poissonDisk) {
  const samples = poissonDisk.length
  let glslCode = 'vec2[' + samples + ']('

  for (let i = 0; i < samples; i++) {
    const sample = poissonDisk[i]
    glslCode += `vec2(${sample.x}, ${sample.y})`

    if (i < samples - 1) {
      glslCode += ','
    }
  }

  glslCode += ')'
  return glslCode
}

const finalFragmentShader$1 = fragmentShader$3.replace('#include <sampleBlueNoise>', sampleBlueNoise).replace('#include <gbuffer_packing>', gbuffer_packing)
const defaultPoissonBlurOptions = {
  iterations: 1,
  radius: 3,
  rings: 3,
  phi: 0.5,
  lumaPhi: 5,
  depthPhi: 2,
  normalPhi: 3.25,
  samples: 8
}

var _updatePoissionDiskSamples = /*#__PURE__*/ _classPrivateFieldLooseKey('updatePoissionDiskSamples')

class PoissionDenoisePass extends Pass {
  constructor(camera, inputTexture, depthTexture, options = defaultPoissonBlurOptions) {
    super('PoissionBlurPass')
    Object.defineProperty(this, _updatePoissionDiskSamples, {
      value: _updatePoissionDiskSamples2
    })
    this.iterations = defaultPoissonBlurOptions.iterations
    this.index = 0
    options = { ...defaultPoissonBlurOptions, ...options }
    this.inputTexture = inputTexture
    this.fullscreenMaterial = new ShaderMaterial({
      fragmentShader: finalFragmentShader$1,
      vertexShader,
      uniforms: {
        depthTexture: {
          value: null
        },
        inputTexture: {
          value: null
        },
        inputTexture2: {
          value: null
        },
        gBuffersTexture: {
          value: null
        },
        projectionMatrixInverse: {
          value: new Matrix4()
        },
        cameraMatrixWorld: {
          value: new Matrix4()
        },
        viewMatrix: {
          value: new Matrix4()
        },
        radius: {
          value: defaultPoissonBlurOptions.radius
        },
        phi: {
          value: defaultPoissonBlurOptions.lumaPhi
        },
        lumaPhi: {
          value: defaultPoissonBlurOptions.lumaPhi
        },
        depthPhi: {
          value: defaultPoissonBlurOptions.depthPhi
        },
        normalPhi: {
          value: defaultPoissonBlurOptions.normalPhi
        },
        roughnessPhi: {
          value: defaultPoissonBlurOptions.roughnessPhi
        },
        diffusePhi: {
          value: defaultPoissonBlurOptions.diffusePhi
        },
        resolution: {
          value: new Vector2()
        },
        blueNoiseTexture: {
          value: null
        },
        index: {
          value: 0
        },
        blueNoiseRepeat: {
          value: new Vector2()
        }
      },
      glslVersion: GLSL3
    })
    const renderTargetOptions = {
      type: HalfFloatType,
      depthBuffer: false
    }
    this.renderTargetA = new WebGLMultipleRenderTargets(1, 1, 2, renderTargetOptions)
    this.renderTargetB = new WebGLMultipleRenderTargets(1, 1, 2, renderTargetOptions)
    const { uniforms } = this.fullscreenMaterial
    uniforms['inputTexture'].value = this.inputTexture
    uniforms['depthTexture'].value = depthTexture
    uniforms['projectionMatrixInverse'].value = camera.projectionMatrixInverse
    uniforms['cameraMatrixWorld'].value = camera.matrixWorld
    uniforms['viewMatrix'].value = camera.matrixWorldInverse
    uniforms['depthPhi'].value = options.depthPhi
    uniforms['normalPhi'].value = options.normalPhi // these properties need the shader to be recompiled

    for (const prop of ['radius', 'rings', 'samples']) {
      Object.defineProperty(this, prop, {
        get: () => options[prop],
        set: (value) => {
          options[prop] = value
          this.setSize(this.renderTargetA.width, this.renderTargetA.height)
        }
      })
    }

    new TextureLoader().load(blueNoiseImage, (blueNoiseTexture) => {
      blueNoiseTexture.minFilter = NearestFilter
      blueNoiseTexture.magFilter = NearestFilter
      blueNoiseTexture.wrapS = RepeatWrapping
      blueNoiseTexture.wrapT = RepeatWrapping
      blueNoiseTexture.colorSpace = NoColorSpace
      this.fullscreenMaterial.uniforms.blueNoiseTexture.value = blueNoiseTexture
    })
  }

  setSize(width, height) {
    this.renderTargetA.setSize(width, height)
    this.renderTargetB.setSize(width, height)
    this.fullscreenMaterial.uniforms.resolution.value.set(width, height)

    _classPrivateFieldLooseBase(this, _updatePoissionDiskSamples)[_updatePoissionDiskSamples](width, height)
  }

  get texture() {
    return this.renderTargetB.texture
  }

  setGBuffersTexture(texture) {
    this.fullscreenMaterial.uniforms.gBuffersTexture.value = texture
  }

  render(renderer) {
    const noiseTexture = this.fullscreenMaterial.uniforms.blueNoiseTexture.value

    if (noiseTexture) {
      const { width, height } = noiseTexture.source.data
      this.fullscreenMaterial.uniforms.blueNoiseRepeat.value.set(this.renderTargetA.width / width, this.renderTargetA.height / height)
    }

    for (let i = 0; i < 2 * this.iterations; i++) {
      const horizontal = i % 2 === 0
      const inputRenderTarget = horizontal ? this.renderTargetB : this.renderTargetA
      this.fullscreenMaterial.uniforms['inputTexture'].value = i === 0 ? this.inputTexture : inputRenderTarget.texture[0]
      this.fullscreenMaterial.uniforms['inputTexture2'].value = i === 0 ? this.inputTexture2 : inputRenderTarget.texture[1]
      const renderTarget = horizontal ? this.renderTargetA : this.renderTargetB
      renderer.setRenderTarget(renderTarget)
      renderer.render(this.scene, this.camera)
      this.fullscreenMaterial.uniforms.index.value++
      this.fullscreenMaterial.uniforms.index.value %= 65536
    }
  }
}

function _updatePoissionDiskSamples2(width, height) {
  const poissonDisk = generateDenoiseSamples(this.samples, this.rings, this.radius, new Vector2(1 / width, 1 / height))
  this.fullscreenMaterial.defines.samples = this.samples
  const poissonDiskConstant = generatePoissonDiskConstant(poissonDisk)
  this.fullscreenMaterial.defines.POISSON_DISK_SAMPLES = poissonDiskConstant
  this.fullscreenMaterial.needsUpdate = true
}

PoissionDenoisePass.DefaultOptions = defaultPoissonBlurOptions

class SVGF {
  constructor(scene, camera, velocityDepthNormalPass, textureCount = 1, options = {}) {
    this.svgfTemporalReprojectPass = new TemporalReprojectPass(scene, camera, velocityDepthNormalPass, textureCount, { ...options, fullAccumulate: true, logTransform: true })
    const textures = this.svgfTemporalReprojectPass.renderTarget.texture.slice(0, textureCount) // this.denoisePass = new DenoisePass(camera, textures, options)
    // this.denoisePass.setMomentTexture(this.svgfTemporalReprojectPass.momentTexture)

    this.denoisePass = new PoissionDenoisePass(camera, textures[0], window.depthTexture, options)
    this.denoisePass.inputTexture2 = textures[1]
    this.svgfTemporalReprojectPass.overrideAccumulatedTextures = this.denoisePass.renderTargetB.texture
    this.setNonJitteredDepthTexture(velocityDepthNormalPass.depthTexture)
  } // the denoised texture

  get texture() {
    return this.denoisePass.texture
  }

  setGBuffers(depthTexture, normalTexture) {
    this.setJitteredGBuffers(depthTexture, normalTexture)
    this.setNonJitteredGBuffers(depthTexture, normalTexture)
  }

  setJitteredGBuffers(depthTexture, normalTexture, { useRoughnessInAlphaChannel = false } = {}) {
    // this.denoisePass.setDepthTexture(depthTexture)
    // this.denoisePass.setNormalTexture(normalTexture, { useRoughnessInAlphaChannel })
  }

  setNonJitteredDepthTexture(depthTexture) {
    this.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.depthTexture.value = depthTexture
  }

  setVelocityTexture(texture) {
    this.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.velocityTexture.value = texture
  }

  setSize(width, height) {
    this.denoisePass.setSize(width, height)
    this.svgfTemporalReprojectPass.setSize(width, height)
  }

  dispose() {
    this.denoisePass.dispose()
    this.svgfTemporalReprojectPass.dispose()
  }

  render(renderer) {
    this.svgfTemporalReprojectPass.render(renderer)
    this.denoisePass.render(renderer)
  }
}

class CubeToEquirectEnvPass extends Pass {
  constructor() {
    super('CubeToEquirectEnvPass')
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      type: FloatType
    })
    this.fullscreenMaterial = new ShaderMaterial({
      fragmentShader:
        /* glsl */
        `
            varying vec2 vUv;
			uniform samplerCube cubeMap;

			#define M_PI 3.1415926535897932384626433832795
			
			// source: https://github.com/spite/CubemapToEquirectangular/blob/master/src/CubemapToEquirectangular.js
            void main() {
				float longitude = vUv.x * 2. * M_PI - M_PI + M_PI / 2.;
				float latitude = vUv.y * M_PI;

				vec3 dir = vec3(
					- sin( longitude ) * sin( latitude ),
					cos( latitude ),
					- cos( longitude ) * sin( latitude )
				);

				dir.y = -dir.y;

				gl_FragColor = textureCube( cubeMap, dir );
            }
            `,
      vertexShader: vertexShader,
      uniforms: {
        cubeMap: {
          value: null
        }
      },
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    })
  }

  dispose() {
    this.renderTarget.dispose()
  }

  generateEquirectEnvMap(renderer, cubeMap, width = null, height = null, maxWidth = 4096) {
    if (width === null && height === null) {
      const w = cubeMap.source.data[0].width
      const widthEquirect = 2 ** Math.ceil(Math.log2(2 * w * 3 ** 0.5))
      const heightEquirect = 2 ** Math.ceil(Math.log2(w * 3 ** 0.5))
      width = widthEquirect
      height = heightEquirect
    }

    if (width > maxWidth) {
      width = maxWidth
      height = maxWidth / 2
    }

    this.renderTarget.setSize(width, height)
    this.fullscreenMaterial.uniforms.cubeMap.value = cubeMap
    const { renderTarget } = this
    renderer.setRenderTarget(renderTarget)
    renderer.render(this.scene, this.camera) // Create a new Float32Array to store the pixel data

    const pixelBuffer = new Float32Array(width * height * 4)
    renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, pixelBuffer) // Create a new data texture

    const equirectEnvMap = new DataTexture(pixelBuffer, width, height, RGBAFormat, FloatType) // Set texture options

    equirectEnvMap.wrapS = ClampToEdgeWrapping
    equirectEnvMap.wrapT = ClampToEdgeWrapping
    equirectEnvMap.minFilter = LinearMipMapLinearFilter
    equirectEnvMap.magFilter = LinearMipMapLinearFilter
    equirectEnvMap.needsUpdate = true
    equirectEnvMap.mapping = EquirectangularReflectionMapping
    return equirectEnvMap
  }
}

// and velocity to "gVelocity" buffer

class MRTMaterial extends ShaderMaterial {
  constructor() {
    super({
      type: 'MRTMaterial',
      defines: {
        USE_UV: '',
        TEMPORAL_RESOLVE: ''
      },
      uniforms: {
        color: new Uniform(new Color()),
        emissive: new Uniform(new Color()),
        map: new Uniform(null),
        roughnessMap: new Uniform(null),
        metalnessMap: new Uniform(null),
        emissiveMap: new Uniform(null),
        alphaMap: new Uniform(null),
        normalMap: new Uniform(null),
        normalScale: new Uniform(new Vector2(1, 1)),
        roughness: new Uniform(0),
        metalness: new Uniform(0),
        emissiveIntensity: new Uniform(0),
        uvTransform: new Uniform(new Matrix3()),
        boneTexture: new Uniform(null),
        blueNoiseTexture: new Uniform(null),
        blueNoiseRepeat: new Uniform(new Vector2(1, 1)),
        texSize: new Uniform(new Vector2(1, 1)),
        frame: new Uniform(0),
        lightMap: new Uniform(null),
        lightMapIntensity: new Uniform(1)
      },
      vertexShader:
        /* glsl */
        `
                varying vec2 vHighPrecisionZW;

                #define NORMAL
                #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
                    varying vec3 vViewPosition;
                #endif
                
                #include <common>
                #include <uv_pars_vertex>
                #include <displacementmap_pars_vertex>
                #include <normal_pars_vertex>
                #include <morphtarget_pars_vertex>
                #include <logdepthbuf_pars_vertex>
                #include <clipping_planes_pars_vertex>
                #include <skinning_pars_vertex>
                #include <color_pars_vertex>

                varying vec2 screenUv;

                void main() {
                    #include <uv_vertex>
                    
                    #include <skinbase_vertex>
                    #include <beginnormal_vertex>
                    #include <skinnormal_vertex>
                    #include <defaultnormal_vertex>

                    #include <morphnormal_vertex>
                    #include <normal_vertex>
                    #include <begin_vertex>
                    #include <morphtarget_vertex>

                    #include <skinning_vertex>

                    #include <displacementmap_vertex>
                    #include <project_vertex>
                    #include <logdepthbuf_vertex>
                    #include <clipping_planes_vertex>

                    #include <color_vertex>
                    
                    #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
                        vViewPosition = - mvPosition.xyz;
                    #endif

                    screenUv = gl_Position.xy * 0.5 + 0.5;

                    vHighPrecisionZW = gl_Position.zw;
                }
            `,
      fragmentShader:
        /* glsl */
        `
                #define NORMAL
                #if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
                    varying vec3 vViewPosition;
                #endif
                #include <packing>
                #include <uv_pars_fragment>
                #include <normal_pars_fragment>
                #include <bumpmap_pars_fragment>
                #include <normalmap_pars_fragment>
                #include <logdepthbuf_pars_fragment>
                #include <clipping_planes_pars_fragment>
                #include <color_pars_fragment>
                #include <alphamap_pars_fragment>
                #include <lightmap_pars_fragment>

                #include <map_pars_fragment>
                uniform vec3 color;

                varying vec2 vHighPrecisionZW;

                #include <metalnessmap_pars_fragment>
                uniform float metalness;

                #include <roughnessmap_pars_fragment>
                uniform float roughness;

                #include <emissivemap_pars_fragment>
                uniform vec3 emissive;
                uniform float emissiveIntensity;

            #ifdef USE_ALPHAMAP
                uniform sampler2D blueNoiseTexture;
                uniform vec2 blueNoiseRepeat;
                uniform vec2 texSize;
                uniform int frame;

                varying vec2 screenUv;

                const float g = 1.6180339887498948482;
                const float a1 = 1.0 / g;

                // reference: https://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/
                float r1(float n) {
                    // 7th harmonious number
                    return fract(1.1127756842787055 + a1 * n);
                }

                const vec4 hn = vec4(0.618033988749895, 0.3247179572447458, 0.2207440846057596, 0.1673039782614187);

                vec4 sampleBlueNoise(vec2 uv, int seed) {
                    vec2 size = uv * texSize;
                    vec2 blueNoiseSize = texSize / blueNoiseRepeat;
                    float blueNoiseIndex = floor(floor(size.y / blueNoiseSize.y) * blueNoiseRepeat.x) + floor(size.x / blueNoiseSize.x);

                    // get the offset of this pixel's blue noise tile
                    int blueNoiseTileOffset = int(r1(blueNoiseIndex + 1.0) * 65536.);

                    vec2 blueNoiseUv = uv * blueNoiseRepeat;

                    // fetch blue noise for this pixel
                    vec4 blueNoise = textureLod(blueNoiseTexture, blueNoiseUv, 0.);

                    // animate blue noise
                    blueNoise = fract(blueNoise + hn * float(seed + blueNoiseTileOffset));

                    blueNoise.r = (blueNoise.r > 0.5 ? 1.0 - blueNoise.r : blueNoise.r) * 2.0;
                    blueNoise.g = (blueNoise.g > 0.5 ? 1.0 - blueNoise.g : blueNoise.g) * 2.0;
                    blueNoise.b = (blueNoise.b > 0.5 ? 1.0 - blueNoise.b : blueNoise.b) * 2.0;
                    blueNoise.a = (blueNoise.a > 0.5 ? 1.0 - blueNoise.a : blueNoise.a) * 2.0;

                    return blueNoise;
                }
            #endif

                #include <gbuffer_packing>

                struct ReflectedLight {
                    vec3 indirectDiffuse;
                };

                void main() {
                    // !todo: properly implement alpha hashing
                    // #ifdef USE_ALPHAMAP
                    // float alpha = textureLod( alphaMap, vUv, 0. ).g;

                    // float alphaThreshold = sampleBlueNoise(screenUv, frame).a;
                    // if(alpha < alphaThreshold){
                    //     discard;
                    //     return;
                    // }
                    // #endif

                    //! todo: find better solution
                    //! todo: also fix texture repeat issue (not being repeated)
                    #define vMapUv vUv
                    #define vMetalnessMapUv vUv
                    #define vRoughnessMapUv vUv
                    #define vNormalMapUv vUv
                    #define vEmissiveMapUv vUv
                    #define vLightMapUv vUv
                    #define vEmissiveMapUv vUv

                    #include <clipping_planes_fragment>
                    #include <logdepthbuf_fragment>
                    #include <normal_fragment_begin>
                    #include <normal_fragment_maps>

                    float roughnessFactor = roughness;
                    bool isDeselected = roughness > 10.0e9;

                    #ifdef USE_ROUGHNESSMAP
                        vec4 texelRoughness = textureLod( roughnessMap, vUv, 0. );
                        // reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
                        roughnessFactor *= texelRoughness.g;
                    #endif

                    // roughness of 1.0 is reserved for deselected meshes
                    roughnessFactor = min(0.99, roughnessFactor);

                    vec3 worldNormal = normalize((vec4(normal, 1.) * viewMatrix).xyz);

                    if(isDeselected){
                        discard;
                        return;
                    }

                    #include <metalnessmap_fragment>

                    vec4 diffuseColor = vec4(color, metalnessFactor);

                    #include <map_fragment>
                    #include <color_fragment>

                    vec3 totalEmissiveRadiance = vec3( emissive * emissiveIntensity );
                    #include <emissivemap_fragment>

                    ReflectedLight reflectedLight;

                    #include <lightmap_fragment>

                    #ifdef USE_LIGHTMAP
                        diffuseColor.rgb *= reflectedLight.indirectDiffuse;
                    #endif

                    gl_FragColor = packGBuffer(diffuseColor.rgb, worldNormal, roughnessFactor, metalnessFactor, totalEmissiveRadiance);
                }
            `.replace('#include <gbuffer_packing>', gbuffer_packing),
      toneMapped: false,
      alphaTest: false,
      fog: false,
      lights: false
    })
    this.normalMapType = TangentSpaceNormalMap
    this.normalScale = new Vector2(1, 1)
  }
}

var fragmentShader$2 =
  '#define GLSLIFY 1\n#if !defined(diffuseOnly) && !defined(specularOnly)\nlayout(location=0)out vec4 gDiffuse;layout(location=1)out vec4 gSpecular;\n#else\n#ifdef diffuseOnly\nlayout(location=0)out vec4 gDiffuse;\n#else\nlayout(location=0)out vec4 gSpecular;\n#endif\n#endif\nvarying vec2 vUv;uniform sampler2D accumulatedTexture;uniform sampler2D depthTexture;uniform sampler2D blueNoiseTexture;uniform sampler2D velocityTexture;uniform mat4 projectionMatrix;uniform mat4 inverseProjectionMatrix;uniform mat4 cameraMatrixWorld;uniform float cameraNear;uniform float cameraFar;uniform float maxEnvMapMipLevel;uniform float rayDistance;uniform float maxRoughness;uniform float thickness;uniform float envBlur;uniform int frame;uniform vec2 texSize;uniform vec2 blueNoiseRepeat;struct EquirectHdrInfo{sampler2D marginalWeights;sampler2D conditionalWeights;sampler2D map;vec2 size;float totalSumWhole;float totalSumDecimal;};uniform EquirectHdrInfo envMapInfo;\n#define INVALID_RAY_COORDS vec2(-1.0);\n#define EPSILON 0.00001\n#define ONE_MINUS_EPSILON 1.0 - EPSILON\nfloat nearMinusFar;float nearMulFar;float farMinusNear;vec2 invTexSize;\n#include <packing>\n#include <gbuffer_packing>\n#include <sampleBlueNoise>\n#include <ssgi_utils>\nvec2 RayMarch(inout vec3 dir,inout vec3 hitPos);vec2 BinarySearch(inout vec3 dir,inout vec3 hitPos);float fastGetViewZ(const float depth);vec3 doSample(const vec3 viewPos,const vec3 viewDir,const vec3 viewNormal,const vec3 worldPosition,const float metalness,const float roughness,const bool isDiffuseSample,const bool isEnvMisSample,const float NoV,const float NoL,const float NoH,const float LoH,const float VoH,const vec2 random,inout vec3 l,inout vec3 hitPos,out bool isMissedRay,out vec3 brdf,out float pdf);void main(){vec4 depthTexel=textureLod(depthTexture,vUv,0.0);if(depthTexel.r==1.0){discard;return;}vec3 diffuse,normal,emissive;float roughness,metalness;getGData(gBuffersTexture,vUv,diffuse,normal,roughness,metalness,emissive);if(roughness==1.0||roughness>maxRoughness){discard;return;}invTexSize=1./texSize;roughness=clamp(roughness*roughness,0.0001,1.0);nearMinusFar=cameraNear-cameraFar;nearMulFar=cameraNear*cameraFar;farMinusNear=cameraFar-cameraNear;float unpackedDepth=depthTexel.r;float depth=fastGetViewZ(unpackedDepth);vec3 viewPos=getViewPosition(depth);vec3 viewDir=normalize(viewPos);vec3 worldNormal=normal;vec3 viewNormal=normalize((vec4(worldNormal,0.)*cameraMatrixWorld).xyz);vec3 worldPos=vec4(vec4(viewPos,1.)*viewMatrix).xyz;vec3 n=viewNormal;vec3 v=-viewDir;float NoV=max(EPSILON,dot(n,v));vec3 V=(vec4(v,0.)*viewMatrix).xyz;vec3 N=worldNormal;vec4 blueNoise;vec3 H,l,h,F,T,B,envMisDir,gi;vec3 diffuseGI,specularGI,brdf,hitPos,specularHitPos;Onb(N,T,B);V=ToLocal(T,B,N,V);vec3 f0=mix(vec3(0.04),diffuse,metalness);float NoL,NoH,LoH,VoH,diffW,specW,invW,pdf,envPdf,diffuseSamples,specularSamples,envMisProbability,envMisMultiplier;bool isDiffuseSample,isEnvMisSample,isMissedRay;int sampleCounter=0;\n#pragma unroll_loop_start\nfor(int i=0;i<spp;i++){blueNoise=sampleBlueNoise(blueNoiseTexture,frame+sampleCounter++,blueNoiseRepeat,texSize);H=SampleGGXVNDF(V,roughness,roughness,blueNoise.r,blueNoise.g);if(H.z<0.0)H=-H;l=normalize(reflect(-V,H));l=ToWorld(T,B,N,l);l=(vec4(l,0.)*cameraMatrixWorld).xyz;l=normalize(l);h=normalize(v+l);NoL=clamp(dot(n,l),EPSILON,ONE_MINUS_EPSILON);NoH=clamp(dot(n,h),EPSILON,ONE_MINUS_EPSILON);LoH=clamp(dot(l,h),EPSILON,ONE_MINUS_EPSILON);VoH=clamp(dot(v,h),EPSILON,ONE_MINUS_EPSILON);\n#if !defined(diffuseOnly) && !defined(specularOnly)\nF=F_Schlick(f0,VoH);diffW=(1.-metalness)*luminance(diffuse);specW=luminance(F);diffW=max(diffW,EPSILON);specW=max(specW,EPSILON);invW=1./(diffW+specW);diffW*=invW;specW*=invW;isDiffuseSample=blueNoise.b<diffW;\n#else\n#ifdef diffuseOnly\nisDiffuseSample=true;\n#else\nisDiffuseSample=false;\n#endif\n#endif\nenvMisDir=vec3(0.0);\n#ifdef importanceSampling\nenvPdf=sampleEquirectProbability(envMapInfo,blueNoise.rg,envMisDir);envMisDir=normalize((vec4(envMisDir,0.)*cameraMatrixWorld).xyz);envMisProbability=0.25+dot(envMisDir,viewNormal)*0.5;isEnvMisSample=blueNoise.a<envMisProbability;envMisMultiplier=1./(1.-envMisProbability);if(isEnvMisSample){envPdf/=1.-envMisProbability;}else{envPdf=0.0001;}\n#else\nenvPdf=0.0;envMisMultiplier=1.;\n#endif\nenvPdf=clamp(envPdf,0.01,4.0);if(isDiffuseSample){if(isEnvMisSample){l=envMisDir;}else{l=cosineSampleHemisphere(viewNormal,blueNoise.rg);}h=normalize(v+l);NoL=clamp(dot(n,l),EPSILON,ONE_MINUS_EPSILON);NoH=clamp(dot(n,h),EPSILON,ONE_MINUS_EPSILON);LoH=clamp(dot(l,h),EPSILON,ONE_MINUS_EPSILON);VoH=clamp(dot(v,h),EPSILON,ONE_MINUS_EPSILON);gi=doSample(viewPos,viewDir,viewNormal,worldPos,metalness,roughness,isDiffuseSample,isEnvMisSample,NoV,NoL,NoH,LoH,VoH,blueNoise.rg,l,hitPos,isMissedRay,brdf,pdf);gi*=brdf;if(isEnvMisSample){gi*=misHeuristic(envPdf,pdf);gi/=envPdf;}else{gi/=pdf;gi*=envMisMultiplier;}diffuseSamples++;diffuseGI=mix(diffuseGI,gi,1./diffuseSamples);}else{isEnvMisSample=isEnvMisSample&&roughness>=0.025;if(isEnvMisSample){l=envMisDir;h=normalize(v+l);NoL=clamp(dot(n,l),EPSILON,ONE_MINUS_EPSILON);NoH=clamp(dot(n,h),EPSILON,ONE_MINUS_EPSILON);LoH=clamp(dot(l,h),EPSILON,ONE_MINUS_EPSILON);VoH=clamp(dot(v,h),EPSILON,ONE_MINUS_EPSILON);}gi=doSample(viewPos,viewDir,viewNormal,worldPos,metalness,roughness,isDiffuseSample,isEnvMisSample,NoV,NoL,NoH,LoH,VoH,blueNoise.rg,l,hitPos,isMissedRay,brdf,pdf);gi*=brdf;if(isEnvMisSample){gi*=misHeuristic(envPdf,pdf);gi/=envPdf;}else{gi/=pdf;gi*=envMisMultiplier;}specularHitPos=hitPos;specularSamples++;specularGI=mix(specularGI,gi,1./specularSamples);}}\n#pragma unroll_loop_end\nroughness=sqrt(roughness);\n#ifndef specularOnly\nif(diffuseSamples==0.0)diffuseGI=vec3(-1.0);gDiffuse=vec4(diffuseGI,roughness);\n#endif\n#ifndef diffuseOnly\nfloat rayLength=0.0;vec4 hitPosWS;if(!isMissedRay){hitPosWS=cameraMatrixWorld*vec4(specularHitPos,1.0);vec3 cameraPosWS=cameraMatrixWorld[3].xyz;rayLength=distance(cameraPosWS,hitPosWS.xyz);}if(specularSamples==0.0)specularGI=vec3(-1.0);gSpecular=vec4(specularGI,rayLength);\n#endif\n}vec3 doSample(const vec3 viewPos,const vec3 viewDir,const vec3 viewNormal,const vec3 worldPosition,const float metalness,const float roughness,const bool isDiffuseSample,const bool isEnvMisSample,const float NoV,const float NoL,const float NoH,const float LoH,const float VoH,const vec2 random,inout vec3 l,inout vec3 hitPos,out bool isMissedRay,out vec3 brdf,out float pdf){float cosTheta=max(0.0,dot(viewNormal,l));if(isDiffuseSample){vec3 diffuseBrdf=vec3(evalDisneyDiffuse(NoL,NoV,LoH,roughness,metalness));pdf=NoL/M_PI;pdf=max(EPSILON,pdf);brdf=diffuseBrdf;}else{vec3 specularBrdf=evalDisneySpecular(roughness,NoH,NoV,NoL);pdf=GGXVNDFPdf(NoH,NoV,roughness);pdf=max(EPSILON,pdf);brdf=specularBrdf;}brdf*=cosTheta;hitPos=viewPos;\n#if steps == 0\nhitPos+=l;vec2 coords=viewSpaceToScreenSpace(hitPos);\n#else\nvec2 coords=RayMarch(l,hitPos);\n#endif\nbool allowMissedRays=false;\n#ifdef missedRays\nallowMissedRays=true;\n#endif\nisMissedRay=coords.x==-1.0;vec3 envMapSample=vec3(0.);if(isMissedRay||allowMissedRays){\n#ifdef USE_ENVMAP\nvec3 reflectedWS=normalize((vec4(l,0.)*viewMatrix).xyz);\n#ifdef BOX_PROJECTED_ENV_MAP\nreflectedWS=parallaxCorrectNormal(reflectedWS.xyz,envMapSize,envMapPosition,worldPosition);reflectedWS=normalize(reflectedWS.xyz);\n#endif\nfloat mip=envBlur*maxEnvMapMipLevel;if(!isDiffuseSample&&roughness<0.15)mip*=roughness/0.15;envMapSample=sampleEquirectEnvMapColor(reflectedWS,envMapInfo.map,mip);float maxEnvLum=isEnvMisSample ? 50.0 : 10.0;if(maxEnvLum!=0.0){float envLum=luminance(envMapSample);if(envLum>maxEnvLum){envMapSample*=maxEnvLum/envLum;}}return envMapSample;\n#else\nreturn vec3(0.0);\n#endif\n}vec4 velocity=textureLod(velocityTexture,coords.xy,0.0);vec2 reprojectedUv=coords.xy-velocity.xy;vec3 SSGI;if(reprojectedUv.x>=0.0&&reprojectedUv.x<=1.0&&reprojectedUv.y>=0.0&&reprojectedUv.y<=1.0){vec3 reprojectedGI=getTexel(accumulatedTexture,reprojectedUv,0.).rgb;SSGI=reprojectedGI;}if(allowMissedRays){float ssgiLum=luminance(SSGI);float envLum=luminance(envMapSample);if(envLum>ssgiLum)SSGI=envMapSample;}return SSGI;}vec2 RayMarch(inout vec3 dir,inout vec3 hitPos){float rayHitDepthDifference;dir*=rayDistance/float(steps);vec2 uv;for(int i=1;i<steps;i++){float m=exp(pow(float(i)/4.0,0.05))-2.0;hitPos+=dir*min(m,1.);if(hitPos.z>0.0)return INVALID_RAY_COORDS;uv=viewSpaceToScreenSpace(hitPos);\n#ifndef missedRays\nif(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)return INVALID_RAY_COORDS;\n#endif\nfloat unpackedDepth=textureLod(depthTexture,uv,0.0).r;float depth=fastGetViewZ(unpackedDepth);rayHitDepthDifference=depth-hitPos.z;if(rayHitDepthDifference>=0.0&&rayHitDepthDifference<thickness){\n#if refineSteps == 0\nreturn uv;\n#else\nreturn BinarySearch(dir,hitPos);\n#endif\n}}\n#ifndef missedRays\nreturn INVALID_RAY_COORDS;\n#endif\nreturn uv;}vec2 BinarySearch(inout vec3 dir,inout vec3 hitPos){float rayHitDepthDifference;vec2 uv;dir*=0.5;hitPos-=dir;for(int i=0;i<refineSteps;i++){uv=viewSpaceToScreenSpace(hitPos);float unpackedDepth=unpackRGBAToDepth(textureLod(depthTexture,uv,0.0));float depth=fastGetViewZ(unpackedDepth);rayHitDepthDifference=depth-hitPos.z;dir*=0.5;hitPos+=rayHitDepthDifference>0.0 ?-dir : dir;}uv=viewSpaceToScreenSpace(hitPos);return uv;}float fastGetViewZ(const float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn nearMulFar/(farMinusNear*depth-cameraFar);\n#else\nreturn depth*nearMinusFar-cameraNear;\n#endif\n}' // eslint-disable-line

var ssgi_utils =
  '#define GLSLIFY 1\n#define PI M_PI\n#define luminance(a) dot(vec3(0.2125, 0.7154, 0.0721), a)\nvec4 getTexel(const sampler2D tex,vec2 p,const float mip){p=p/invTexSize+0.5;vec2 i=floor(p);vec2 f=p-i;f=f*f*f*(f*(f*6.0-15.0)+10.0);p=i+f;p=(p-0.5)*invTexSize;return textureLod(tex,p,mip);}float getViewZ(const float depth){return perspectiveDepthToViewZ(depth,cameraNear,cameraFar);}vec3 getViewPosition(const float depth){float clipW=projectionMatrix[2][3]*depth+projectionMatrix[3][3];vec4 clipPosition=vec4((vec3(vUv,depth)-0.5)*2.0,1.0);clipPosition*=clipW;return(inverseProjectionMatrix*clipPosition).xyz;}vec2 viewSpaceToScreenSpace(const vec3 position){vec4 projectedCoord=projectionMatrix*vec4(position,1.0);projectedCoord.xy/=projectedCoord.w;projectedCoord.xy=projectedCoord.xy*0.5+0.5;return projectedCoord.xy;}vec3 worldSpaceToViewSpace(vec3 worldPosition){vec4 viewPosition=viewMatrix*vec4(worldPosition,1.0);return viewPosition.xyz/viewPosition.w;}\n#ifdef BOX_PROJECTED_ENV_MAP\nuniform vec3 envMapSize;uniform vec3 envMapPosition;vec3 parallaxCorrectNormal(const vec3 v,const vec3 cubeSize,const vec3 cubePos,const vec3 worldPosition){vec3 nDir=normalize(v);vec3 rbmax=(.5*cubeSize+cubePos-worldPosition)/nDir;vec3 rbmin=(-.5*cubeSize+cubePos-worldPosition)/nDir;vec3 rbminmax;rbminmax.x=(nDir.x>0.)? rbmax.x : rbmin.x;rbminmax.y=(nDir.y>0.)? rbmax.y : rbmin.y;rbminmax.z=(nDir.z>0.)? rbmax.z : rbmin.z;float correction=min(min(rbminmax.x,rbminmax.y),rbminmax.z);vec3 boxIntersection=worldPosition+nDir*correction;return boxIntersection-cubePos;}\n#endif\n#define M_PI 3.1415926535897932384626433832795\nvec2 equirectDirectionToUv(const vec3 direction){vec2 uv=vec2(atan(direction.z,direction.x),acos(direction.y));uv/=vec2(2.0*M_PI,M_PI);uv.x+=0.5;uv.y=1.0-uv.y;return uv;}vec3 equirectUvToDirection(vec2 uv){uv.x-=0.5;uv.y=1.0-uv.y;float theta=uv.x*2.0*PI;float phi=uv.y*PI;float sinPhi=sin(phi);return vec3(sinPhi*cos(theta),cos(phi),sinPhi*sin(theta));}vec3 sampleEquirectEnvMapColor(const vec3 direction,const sampler2D map,const float lod){return getTexel(map,equirectDirectionToUv(direction),lod).rgb;}mat3 getBasisFromNormal(const vec3 normal){vec3 other;if(abs(normal.x)>0.5){other=vec3(0.0,1.0,0.0);}else{other=vec3(1.0,0.0,0.0);}vec3 ortho=normalize(cross(normal,other));vec3 ortho2=normalize(cross(normal,ortho));return mat3(ortho2,ortho,normal);}vec3 F_Schlick(const vec3 f0,const float theta){return f0+(1.-f0)*pow(1.0-theta,5.);}float F_Schlick(const float f0,const float f90,const float theta){return f0+(f90-f0)*pow(1.0-theta,5.0);}float D_GTR(const float roughness,const float NoH,const float k){float a2=pow(roughness,2.);return a2/(PI*pow((NoH*NoH)*(a2*a2-1.)+1.,k));}float SmithG(const float NDotV,const float alphaG){float a=alphaG*alphaG;float b=NDotV*NDotV;return(2.0*NDotV)/(NDotV+sqrt(a+b-a*b));}float GGXVNDFPdf(const float NoH,const float NoV,const float roughness){float D=D_GTR(roughness,NoH,2.);float G1=SmithG(NoV,roughness*roughness);return(D*G1)/max(0.00001,4.0f*NoV);}float GeometryTerm(const float NoL,const float NoV,const float roughness){float a2=roughness*roughness;float G1=SmithG(NoV,a2);float G2=SmithG(NoL,a2);return G1*G2;}float evalDisneyDiffuse(const float NoL,const float NoV,const float LoH,const float roughness,const float metalness){float FD90=0.5+2.*roughness*pow(LoH,2.);float a=F_Schlick(1.,FD90,NoL);float b=F_Schlick(1.,FD90,NoV);return(a*b/PI)*(1.-metalness);}vec3 evalDisneySpecular(const float roughness,const float NoH,const float NoV,const float NoL){float D=D_GTR(roughness,NoH,2.);float G=GeometryTerm(NoL,NoV,pow(0.5+roughness*.5,2.));vec3 spec=vec3(D*G/(4.*NoL*NoV));return spec;}vec3 SampleGGXVNDF(const vec3 V,const float ax,const float ay,const float r1,const float r2){vec3 Vh=normalize(vec3(ax*V.x,ay*V.y,V.z));float lensq=Vh.x*Vh.x+Vh.y*Vh.y;vec3 T1=lensq>0. ? vec3(-Vh.y,Vh.x,0.)*inversesqrt(lensq): vec3(1.,0.,0.);vec3 T2=cross(Vh,T1);float r=sqrt(r1);float phi=2.0*PI*r2;float t1=r*cos(phi);float t2=r*sin(phi);float s=0.5*(1.0+Vh.z);t2=(1.0-s)*sqrt(1.0-t1*t1)+s*t2;vec3 Nh=t1*T1+t2*T2+sqrt(max(0.0,1.0-t1*t1-t2*t2))*Vh;return normalize(vec3(ax*Nh.x,ay*Nh.y,max(0.0,Nh.z)));}void Onb(const vec3 N,inout vec3 T,inout vec3 B){vec3 up=abs(N.z)<0.9999999 ? vec3(0,0,1): vec3(1,0,0);T=normalize(cross(up,N));B=cross(N,T);}vec3 ToLocal(const vec3 X,const vec3 Y,const vec3 Z,const vec3 V){return vec3(dot(V,X),dot(V,Y),dot(V,Z));}vec3 ToWorld(const vec3 X,const vec3 Y,const vec3 Z,const vec3 V){return V.x*X+V.y*Y+V.z*Z;}vec3 cosineSampleHemisphere(const vec3 n,const vec2 u){float r=sqrt(u.x);float theta=2.0*PI*u.y;vec3 b=normalize(cross(n,vec3(0.0,1.0,1.0)));vec3 t=cross(b,n);return normalize(r*sin(theta)*b+sqrt(1.0-u.x)*n+r*cos(theta)*t);}float equirectDirectionPdf(vec3 direction){vec2 uv=equirectDirectionToUv(direction);float theta=uv.y*PI;float sinTheta=sin(theta);if(sinTheta==0.0){return 0.0;}return 1.0/(2.0*PI*PI*sinTheta);}float sampleEquirectProbability(EquirectHdrInfo info,vec2 r,out vec3 direction){float v=textureLod(info.marginalWeights,vec2(r.x,0.0),0.).x;float u=textureLod(info.conditionalWeights,vec2(r.y,v),0.).x;vec2 uv=vec2(u,v);vec3 derivedDirection=equirectUvToDirection(uv);direction=derivedDirection;vec3 color=texture(info.map,uv).rgb;float totalSum=info.totalSumWhole+info.totalSumDecimal;float lum=luminance(color);float pdf=lum/totalSum;return info.size.x*info.size.y*pdf;}float misHeuristic(float a,float b){float aa=a*a;float bb=b*b;return aa/(aa+bb);}vec3 alignToNormal(const vec3 normal,const vec3 direction){vec3 tangent;vec3 bitangent;Onb(normal,tangent,bitangent);vec3 localDir=ToLocal(tangent,bitangent,normal,direction);vec3 localDirAligned=vec3(localDir.x,localDir.y,abs(localDir.z));vec3 alignedDir=ToWorld(tangent,bitangent,normal,localDirAligned);return alignedDir;}float getFlatness(vec3 g,vec3 rp){vec3 gw=fwidth(g);vec3 pw=fwidth(rp);float wfcurvature=length(gw)/length(pw);wfcurvature=smoothstep(0.0,30.,wfcurvature);return clamp(wfcurvature,0.,1.);}' // eslint-disable-line

// source: https://github.com/gkjohnson/three-gpu-pathtracer/blob/main/src/uniforms/EquirectHdrInfoUniform.js

const workerOnMessage = ({ data: { width, height, isFloatType, flipY, data } }) => {
  // from: https://github.com/mrdoob/three.js/blob/dev/src/extras/DataUtils.js
  // importing modules doesn't seem to work for workers that were generated through createObjectURL() for some reason
  const _tables = /* @__PURE__*/ _generateTables()

  function _generateTables() {
    // float32 to float16 helpers
    const buffer = new ArrayBuffer(4)
    const floatView = new Float32Array(buffer)
    const uint32View = new Uint32Array(buffer)
    const baseTable = new Uint32Array(512)
    const shiftTable = new Uint32Array(512)

    for (let i = 0; i < 256; ++i) {
      const e = i - 127 // very small number (0, -0)

      if (e < -27) {
        baseTable[i] = 0x0000
        baseTable[i | 0x100] = 0x8000
        shiftTable[i] = 24
        shiftTable[i | 0x100] = 24 // small number (denorm)
      } else if (e < -14) {
        baseTable[i] = 0x0400 >> (-e - 14)
        baseTable[i | 0x100] = (0x0400 >> (-e - 14)) | 0x8000
        shiftTable[i] = -e - 1
        shiftTable[i | 0x100] = -e - 1 // normal number
      } else if (e <= 15) {
        baseTable[i] = (e + 15) << 10
        baseTable[i | 0x100] = ((e + 15) << 10) | 0x8000
        shiftTable[i] = 13
        shiftTable[i | 0x100] = 13 // large number (Infinity, -Infinity)
      } else if (e < 128) {
        baseTable[i] = 0x7c00
        baseTable[i | 0x100] = 0xfc00
        shiftTable[i] = 24
        shiftTable[i | 0x100] = 24 // stay (NaN, Infinity, -Infinity)
      } else {
        baseTable[i] = 0x7c00
        baseTable[i | 0x100] = 0xfc00
        shiftTable[i] = 13
        shiftTable[i | 0x100] = 13
      }
    } // float16 to float32 helpers

    const mantissaTable = new Uint32Array(2048)
    const exponentTable = new Uint32Array(64)
    const offsetTable = new Uint32Array(64)

    for (let i = 1; i < 1024; ++i) {
      let m = i << 13 // zero pad mantissa bits

      let e = 0 // zero exponent
      // normalized

      while ((m & 0x00800000) === 0) {
        m <<= 1
        e -= 0x00800000 // decrement exponent
      }

      m &= ~0x00800000 // clear leading 1 bit

      e += 0x38800000 // adjust bias

      mantissaTable[i] = m | e
    }

    for (let i = 1024; i < 2048; ++i) {
      mantissaTable[i] = 0x38000000 + ((i - 1024) << 13)
    }

    for (let i = 1; i < 31; ++i) {
      exponentTable[i] = i << 23
    }

    exponentTable[31] = 0x47800000
    exponentTable[32] = 0x80000000

    for (let i = 33; i < 63; ++i) {
      exponentTable[i] = 0x80000000 + ((i - 32) << 23)
    }

    exponentTable[63] = 0xc7800000

    for (let i = 1; i < 64; ++i) {
      if (i !== 32) {
        offsetTable[i] = 1024
      }
    }

    return {
      floatView: floatView,
      uint32View: uint32View,
      baseTable: baseTable,
      shiftTable: shiftTable,
      mantissaTable: mantissaTable,
      exponentTable: exponentTable,
      offsetTable: offsetTable
    }
  }

  function fromHalfFloat(val) {
    const m = val >> 10
    _tables.uint32View[0] = _tables.mantissaTable[_tables.offsetTable[m] + (val & 0x3ff)] + _tables.exponentTable[m]
    return _tables.floatView[0]
  }

  function colorToLuminance(r, g, b) {
    // https://en.wikipedia.org/wiki/Relative_luminance
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const binarySearchFindClosestIndexOf = (array, targetValue, offset = 0, count = array.length) => {
    let lower = offset
    let upper = offset + count - 1

    while (lower < upper) {
      const mid = (lower + upper) >> 1 // check if the middle array value is above or below the target and shift
      // which half of the array we're looking at

      if (array[mid] < targetValue) {
        lower = mid + 1
      } else {
        upper = mid
      }
    }

    return lower - offset
  }

  const gatherData = (data, width, height, flipY, marginalDataArray, conditionalDataArray) => {
    // "conditional" = "pixel relative to row pixels sum"
    // "marginal" = "row relative to row sum"
    // remove any y flipping for cdf computation
    if (flipY) {
      for (let y = 0, h = height - 1; y <= h; y++) {
        for (let x = 0, w = width * 4; x < w; x += 4) {
          const newY = h - y
          const ogIndex = y * w + x
          const newIndex = newY * w + x
          data[newIndex] = data[ogIndex]
          data[newIndex + 1] = data[ogIndex + 1]
          data[newIndex + 2] = data[ogIndex + 2]
          data[newIndex + 3] = data[ogIndex + 3]
        }
      }
    } // track the importance of any given pixel in the image by tracking its weight relative to other pixels in the image

    const pdfConditional = new Float32Array(width * height)
    const cdfConditional = new Float32Array(width * height)
    const pdfMarginal = new Float32Array(height)
    const cdfMarginal = new Float32Array(height)
    let totalSumValue = 0.0
    let cumulativeWeightMarginal = 0.0

    for (let y = 0; y < height; y++) {
      let cumulativeRowWeight = 0.0

      for (let x = 0; x < width; x++) {
        const i = y * width + x
        const r = data[4 * i + 0]
        const g = data[4 * i + 1]
        const b = data[4 * i + 2] // the probability of the pixel being selected in this row is the
        // scale of the luminance relative to the rest of the pixels.
        // TODO: this should also account for the solid angle of the pixel when sampling

        const weight = colorToLuminance(r, g, b)
        cumulativeRowWeight += weight
        totalSumValue += weight
        pdfConditional[i] = weight
        cdfConditional[i] = cumulativeRowWeight
      } // can happen if the row is all black

      if (cumulativeRowWeight !== 0) {
        // scale the pdf and cdf to [0.0, 1.0]
        for (let i = y * width, l = y * width + width; i < l; i++) {
          pdfConditional[i] /= cumulativeRowWeight
          cdfConditional[i] /= cumulativeRowWeight
        }
      }

      cumulativeWeightMarginal += cumulativeRowWeight // compute the marginal pdf and cdf along the height of the map.

      pdfMarginal[y] = cumulativeRowWeight
      cdfMarginal[y] = cumulativeWeightMarginal
    } // can happen if the texture is all black

    if (cumulativeWeightMarginal !== 0) {
      // scale the marginal pdf and cdf to [0.0, 1.0]
      for (let i = 0, l = pdfMarginal.length; i < l; i++) {
        pdfMarginal[i] /= cumulativeWeightMarginal
        cdfMarginal[i] /= cumulativeWeightMarginal
      }
    } // compute a sorted index of distributions and the probabilities along them for both
    // the marginal and conditional data. These will be used to sample with a random number
    // to retrieve a uv value to sample in the environment map.
    // These values continually increase so it's okay to interpolate between them.
    // we add a half texel offset so we're sampling the center of the pixel

    for (let i = 0; i < height; i++) {
      const dist = (i + 1) / height
      const row = binarySearchFindClosestIndexOf(cdfMarginal, dist)
      marginalDataArray[i] = (row + 0.5) / height
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x
        const dist = (x + 1) / width
        const col = binarySearchFindClosestIndexOf(cdfConditional, dist, y * width, width)
        conditionalDataArray[i] = (col + 0.5) / width
      }
    }

    return totalSumValue
  }

  if (!isFloatType) {
    const newData = new Float32Array(data.length) // eslint-disable-next-line guard-for-in

    for (const i in data) {
      newData[i] = fromHalfFloat(data[i])
    }

    data = newData
  }

  const marginalDataArray = new Float32Array(height)
  const conditionalDataArray = new Float32Array(width * height)
  const totalSumValue = gatherData(data, width, height, flipY, marginalDataArray, conditionalDataArray)

  if (isFloatType) {
    postMessage({
      totalSumValue,
      marginalDataArray,
      conditionalDataArray
    })
  } else {
    postMessage({
      data,
      totalSumValue,
      marginalDataArray,
      conditionalDataArray
    })
  }
}

const blob = new Blob(['onmessage = ' + workerOnMessage], {
  type: 'application/javascript'
})
const workerUrl = URL.createObjectURL(blob)
class EquirectHdrInfoUniform {
  constructor() {
    // Default to a white texture and associated weights so we don't
    // just render black initially.
    const whiteTex = new DataTexture(new Float32Array([1, 1, 1, 1]), 1, 1)
    whiteTex.type = FloatType
    whiteTex.format = RGBAFormat
    whiteTex.minFilter = LinearFilter
    whiteTex.magFilter = LinearFilter
    whiteTex.wrapS = RepeatWrapping
    whiteTex.wrapT = RepeatWrapping
    whiteTex.generateMipmaps = false
    whiteTex.needsUpdate = true // Stores a map of [0, 1] value -> cumulative importance row & pdf
    // used to sampling a random value to a relevant row to sample from

    const marginalWeights = new DataTexture(new Float32Array([0, 1]), 1, 2)
    marginalWeights.type = FloatType
    marginalWeights.format = RedFormat
    marginalWeights.minFilter = LinearFilter
    marginalWeights.magFilter = LinearFilter
    marginalWeights.generateMipmaps = false
    marginalWeights.needsUpdate = true // Stores a map of [0, 1] value -> cumulative importance column & pdf
    // used to sampling a random value to a relevant pixel to sample from

    const conditionalWeights = new DataTexture(new Float32Array([0, 0, 1, 1]), 2, 2)
    conditionalWeights.type = FloatType
    conditionalWeights.format = RedFormat
    conditionalWeights.minFilter = LinearFilter
    conditionalWeights.magFilter = LinearFilter
    conditionalWeights.generateMipmaps = false
    conditionalWeights.needsUpdate = true
    this.map = whiteTex
    this.marginalWeights = marginalWeights
    this.conditionalWeights = conditionalWeights // the total sum value is separated into two values to work around low precision
    // storage of floating values in structs

    this.totalSumWhole = 1
    this.totalSumDecimal = 0
    this.size = new Vector2()
  }

  dispose() {
    this.marginalWeights.dispose()
    this.conditionalWeights.dispose()
    this.map.dispose()
  }

  updateFrom(map) {
    map = map.clone()
    const { width, height, data } = map.image
    const { type } = map
    this.size.set(width, height)
    return new Promise((resolve) => {
      var _this$worker

      ;(_this$worker = this.worker) == null ? void 0 : _this$worker.terminate()
      this.worker = new Worker(workerUrl)
      this.worker.postMessage({
        width,
        height,
        isFloatType: type === FloatType,
        flipY: map.flipY,
        data
      })

      this.worker.onmessage = ({ data: { data, totalSumValue, marginalDataArray, conditionalDataArray } }) => {
        this.dispose()
        const { marginalWeights, conditionalWeights } = this
        marginalWeights.image = {
          width: height,
          height: 1,
          data: marginalDataArray
        }
        marginalWeights.needsUpdate = true
        conditionalWeights.image = {
          width,
          height,
          data: conditionalDataArray
        }
        conditionalWeights.needsUpdate = true
        const totalSumWhole = ~~totalSumValue
        const totalSumDecimal = totalSumValue - totalSumWhole
        this.totalSumWhole = totalSumWhole
        this.totalSumDecimal = totalSumDecimal

        if (data) {
          map.source = new Source({ ...map.image })
          map.image = {
            width,
            height,
            data
          }
          map.type = FloatType
        }

        this.map = map
        this.worker = null
        resolve(map)
      }
    })
  }
}

class SSGIMaterial extends ShaderMaterial {
  constructor() {
    super({
      type: 'SSGIMaterial',
      uniforms: {
        accumulatedTexture: new Uniform(null),
        gBuffersTexture: new Uniform(null),
        depthTexture: new Uniform(null),
        velocityTexture: new Uniform(null),
        blueNoiseTexture: new Uniform(null),
        projectionMatrix: new Uniform(new Matrix4()),
        inverseProjectionMatrix: new Uniform(new Matrix4()),
        cameraMatrixWorld: new Uniform(new Matrix4()),
        viewMatrix: new Uniform(new Matrix4()),
        cameraNear: new Uniform(0),
        cameraFar: new Uniform(0),
        rayDistance: new Uniform(0),
        thickness: new Uniform(0),
        frame: new Uniform(0),
        envBlur: new Uniform(0),
        maxRoughness: new Uniform(0),
        maxEnvMapMipLevel: new Uniform(0),
        envMapInfo: {
          value: new EquirectHdrInfoUniform()
        },
        envMapPosition: new Uniform(new Vector3()),
        envMapSize: new Uniform(new Vector3()),
        texSize: new Uniform(new Vector2()),
        blueNoiseRepeat: new Uniform(new Vector2())
      },
      defines: {
        steps: 20,
        refineSteps: 5,
        spp: 1,
        CUBEUV_TEXEL_WIDTH: 0,
        CUBEUV_TEXEL_HEIGHT: 0,
        CUBEUV_MAX_MIP: 0,
        vWorldPosition: 'worldPos'
      },
      fragmentShader: fragmentShader$2.replace('#include <ssgi_utils>', ssgi_utils).replace('#include <gbuffer_packing>', gbuffer_packing).replace('#include <sampleBlueNoise>', sampleBlueNoise),
      vertexShader,
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      glslVersion: GLSL3
    })
  }
}

const backgroundColor$1 = new Color(0)
class SSGIPass extends Pass {
  constructor(ssgiEffect, options) {
    super('SSGIPass')
    this.needsSwap = false
    this.defaultFragmentShader = ''
    this.frame = 0
    this.cachedMaterials = new WeakMap()
    this.visibleMeshes = []
    this.ssgiEffect = ssgiEffect
    this._scene = ssgiEffect._scene
    this._camera = ssgiEffect._camera
    this.fullscreenMaterial = new SSGIMaterial()
    this.defaultFragmentShader = this.fullscreenMaterial.fragmentShader
    const bufferCount = !options.diffuseOnly && !options.specularOnly ? 2 : 1
    this.renderTarget = new WebGLMultipleRenderTargets(1, 1, bufferCount, {
      type: HalfFloatType,
      depthBuffer: false
    }) // set up basic uniforms that we don't have to update

    this.fullscreenMaterial.uniforms.cameraMatrixWorld.value = this._camera.matrixWorld
    this.fullscreenMaterial.uniforms.viewMatrix.value = this._camera.matrixWorldInverse
    this.fullscreenMaterial.uniforms.projectionMatrix.value = this._camera.projectionMatrix
    this.fullscreenMaterial.uniforms.inverseProjectionMatrix.value = this._camera.projectionMatrixInverse
    if (ssgiEffect._camera.isPerspectiveCamera) this.fullscreenMaterial.defines.PERSPECTIVE_CAMERA = ''
    if (options.diffuseOnly) this.fullscreenMaterial.defines.diffuseOnly = ''
    if (options.specularOnly) this.fullscreenMaterial.defines.specularOnly = ''
    this.initMRTRenderTarget()
  }

  initialize(renderer, ...args) {
    super.initialize(renderer, ...args)
    new TextureLoader().load(blueNoiseImage, (blueNoiseTexture) => {
      blueNoiseTexture.minFilter = NearestFilter
      blueNoiseTexture.magFilter = NearestFilter
      blueNoiseTexture.wrapS = RepeatWrapping
      blueNoiseTexture.wrapT = RepeatWrapping
      blueNoiseTexture.colorSpace = NoColorSpace
      blueNoiseTexture.needsUpdate = true
      this.fullscreenMaterial.uniforms.blueNoiseTexture.value = blueNoiseTexture
    })
  }

  get texture() {
    return this.renderTarget.texture[0]
  }

  get specularTexture() {
    const index = 'specularOnly' in this.fullscreenMaterial.defines ? 0 : 1
    return this.renderTarget.texture[index]
  }

  initMRTRenderTarget() {
    this.gBuffersRenderTarget = new WebGLRenderTarget(1, 1, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      type: FloatType
    })
    this.depthTexture = this.ssgiEffect.composer.depthTexture
    this.fullscreenMaterial.uniforms.depthTexture.value = this.depthTexture
    this.gBuffersRenderTarget.depthTexture = this.depthTexture
    this.fullscreenMaterial.uniforms.gBuffersTexture.value = this.gBuffersRenderTarget.texture
  }

  setSize(width, height) {
    this.renderTarget.setSize(width * this.ssgiEffect.resolutionScale, height * this.ssgiEffect.resolutionScale)
    this.gBuffersRenderTarget.setSize(width, height)
    this.fullscreenMaterial.uniforms.texSize.value.set(this.renderTarget.width, this.renderTarget.height)
  }

  dispose() {
    super.dispose()
    this.renderTarget.dispose()
    this.gBuffersRenderTarget.dispose()
    this.fullscreenMaterial.dispose()
    this.normalTexture = null
    this.depthTexture = null
    this.diffuseTexture = null
    this.emissiveTexture = null
  }

  setMRTMaterialInScene() {
    this.visibleMeshes = getVisibleChildren(this._scene)

    for (const c of this.visibleMeshes) {
      var _originalMaterial$rou, _c$material$metalness, _c$material$emissiveI

      const originalMaterial = c.material
      let [cachedOriginalMaterial, mrtMaterial] = this.cachedMaterials.get(c) || []

      if (originalMaterial !== cachedOriginalMaterial) {
        var _c$skeleton

        if (mrtMaterial) mrtMaterial.dispose()
        mrtMaterial = new MRTMaterial()
        copyNecessaryProps(originalMaterial, mrtMaterial)
        mrtMaterial.uniforms.normalScale.value = originalMaterial.normalScale

        if ((_c$skeleton = c.skeleton) != null && _c$skeleton.boneTexture) {
          mrtMaterial.defines.USE_SKINNING = ''
          mrtMaterial.defines.BONE_TEXTURE = ''
          mrtMaterial.uniforms.boneTexture.value = c.skeleton.boneTexture
          mrtMaterial.needsUpdate = true
        }

        const textureKey = Object.keys(originalMaterial).find((key) => {
          const value = originalMaterial[key]
          return value instanceof Texture && value.matrix
        })
        if (textureKey) mrtMaterial.uniforms.uvTransform.value = originalMaterial[textureKey].matrix
        this.cachedMaterials.set(c, [originalMaterial, mrtMaterial])
      }

      if (originalMaterial.emissive) mrtMaterial.uniforms.emissive.value = originalMaterial.emissive
      if (originalMaterial.color) mrtMaterial.uniforms.color.value = originalMaterial.color // update the child's MRT material

      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'normalMap', 'USE_NORMALMAP_TANGENTSPACE', true) // todo: object space normals support

      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'roughnessMap', 'USE_ROUGHNESSMAP', true)
      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'metalnessMap', 'USE_	METALNESSMAP', true)
      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'map', 'USE_MAP', true)
      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'emissiveMap', 'USE_EMISSIVEMAP', true)
      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'alphaMap', 'USE_ALPHAMAP', true)
      keepMaterialMapUpdated(mrtMaterial, originalMaterial, 'lightMap', 'USE_LIGHTMAP', true)
      const noiseTexture = this.fullscreenMaterial.uniforms.blueNoiseTexture.value

      if (noiseTexture) {
        const { width, height } = noiseTexture.source.data
        mrtMaterial.uniforms.blueNoiseTexture.value = noiseTexture
        mrtMaterial.uniforms.blueNoiseRepeat.value.set(this.renderTarget.width / width, this.renderTarget.height / height)
      }

      mrtMaterial.uniforms.texSize.value.set(this.renderTarget.width, this.renderTarget.height)
      mrtMaterial.uniforms.frame.value = this.frame
      c.visible = isChildMaterialRenderable(c, originalMaterial)
      const origRoughness = (_originalMaterial$rou = originalMaterial.roughness) !== null && _originalMaterial$rou !== void 0 ? _originalMaterial$rou : 1
      mrtMaterial.uniforms.roughness.value = this.ssgiEffect.selection.size === 0 || this.ssgiEffect.selection.has(c) ? origRoughness : 10e10
      mrtMaterial.uniforms.metalness.value = (_c$material$metalness = c.material.metalness) !== null && _c$material$metalness !== void 0 ? _c$material$metalness : 0
      mrtMaterial.uniforms.emissiveIntensity.value = (_c$material$emissiveI = c.material.emissiveIntensity) !== null && _c$material$emissiveI !== void 0 ? _c$material$emissiveI : 0
      c.material = mrtMaterial
    }
  }

  unsetMRTMaterialInScene() {
    for (const c of this.visibleMeshes) {
      c.visible = true // set material back to the original one

      const [originalMaterial] = this.cachedMaterials.get(c)
      c.material = originalMaterial
    }
  }

  render(renderer) {
    this.frame = (this.frame + this.ssgiEffect.spp) % 65536
    const { background } = this._scene
    this._scene.background = backgroundColor$1
    this.setMRTMaterialInScene()
    renderer.setRenderTarget(this.gBuffersRenderTarget)
    renderer.render(this._scene, this._camera)
    this.unsetMRTMaterialInScene() // update uniforms

    this.fullscreenMaterial.uniforms.frame.value = this.frame
    this.fullscreenMaterial.uniforms.cameraNear.value = this._camera.near
    this.fullscreenMaterial.uniforms.cameraFar.value = this._camera.far
    this.fullscreenMaterial.uniforms.viewMatrix.value.copy(this._camera.matrixWorldInverse)
    this.fullscreenMaterial.uniforms.accumulatedTexture.value = this.ssgiEffect.ssgiComposePass.renderTarget.texture
    const noiseTexture = this.fullscreenMaterial.uniforms.blueNoiseTexture.value

    if (noiseTexture) {
      const { width, height } = noiseTexture.source.data
      this.fullscreenMaterial.uniforms.blueNoiseRepeat.value.set(this.renderTarget.width / width, this.renderTarget.height / height)
    }

    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
    this._scene.background = background
  }
}

/**
 * Options of the SSGI effect
 * @typedef {Object} SSGIOptions
 * @property {Number} [distance] maximum distance a SSGI ray can travel to find what it reflects
 * @property {Number} [thickness] maximum depth difference between a ray and the particular depth at its screen position before refining with binary search; higher values will result in better performance
 * @property {Number} [maxRoughness] maximum roughness a texel can have to have SSGI calculated for it
 * @property {Number} [blend] a value between 0 and 1 to set how much the last frame's SSGI should be blended in; higher values will result in less noisy SSGI when moving the camera but a more smeary look
 * @property {Number} [denoiseIterations] how many times the denoise filter runs, more iterations will denoise the frame better but need more performance
 * @property {Number} [denoiseKernel] the kernel (~ number of neighboring pixels) to take into account when denoising a pixel
 * @property {Number} [denoiseDiffuse] diffuse luminance factor of the denoiser, higher values will denoise areas with varying luminance more aggressively
 * @property {Number} [denoiseSpecular] specular luminance factor of the denoiser, higher values will denoise areas with varying luminance more aggressively
 * @property {Number} [depthPhi] depth factor of the denoiser, higher values will use neighboring areas with different depth values more resulting in less noise but loss of details
 * @property {Number} [depthPhi] normals factor of the denoiser, higher values will use neighboring areas with different normals more resulting in less noise but loss of details and sharpness
 * @property {Number} [roughnessPhi] roughness factor of the denoiser setting how much the denoiser should only apply the blur to rougher surfaces, a value of 0 means the denoiser will blur mirror-like surfaces the same as rough surfaces
 * @property {Number} [envBlur] higher values will result in lower mipmaps being sampled which will cause less noise but also less detail regarding environment lighting
 * @property {Number} [importanceSampling] whether to use importance sampling for the environment map
 * @property {Number} [steps] number of steps a SSGI ray can maximally do to find an object it intersected (and thus reflects)
 * @property {Number} [refineSteps] once we had our ray intersect something, we need to find the exact point in space it intersected and thus it reflects; this can be done through binary search with the given number of maximum steps
 * @property {Number} [spp] number of samples per pixel
 * @property {boolean} [missedRays] if there should still be SSGI for rays for which a reflecting point couldn't be found; enabling this will result in stretched looking SSGI which can look good or bad depending on the angle
 * @property {Number} [resolutionScale] resolution of the SSGI effect, a resolution of 0.5 means the effect will be rendered at half resolution
 */

/**
 * The options of the SSGI effect
 * @type {SSGIOptions}
 */
const defaultSSGIOptions = {
  distance: 10,
  thickness: 10,
  maxRoughness: 1,
  blend: 0.9,
  denoiseIterations: 1,
  denoiseKernel: 2,
  denoiseDiffuse: 10,
  denoiseSpecular: 10,
  rings: 5.625,
  samples: 8,
  radius: 3,
  phi: 0.5,
  lumaPhi: 5,
  depthPhi: 2,
  normalPhi: 50,
  roughnessPhi: 50,
  diffusePhi: 0,
  envBlur: 0.5,
  importanceSampling: true,
  steps: 20,
  refineSteps: 5,
  spp: 1,
  resolutionScale: 1,
  missedRays: false
}

var ssgi_poisson_compose_functions =
  '#define GLSLIFY 1\nvec3 getViewPosition(const float depth){float clipW=projectionMatrix[2][3]*depth+projectionMatrix[3][3];vec4 clipPosition=vec4((vec3(vUv,depth)-0.5)*2.0,1.0);clipPosition*=clipW;return(projectionMatrixInverse*clipPosition).xyz;}vec3 F_Schlick(const vec3 f0,const float theta){return f0+(1.-f0)*pow(1.0-theta,5.);}vec3 SampleGGXVNDF(const vec3 V,const float ax,const float ay,const float r1,const float r2){vec3 Vh=normalize(vec3(ax*V.x,ay*V.y,V.z));float lensq=Vh.x*Vh.x+Vh.y*Vh.y;vec3 T1=lensq>0. ? vec3(-Vh.y,Vh.x,0.)*inversesqrt(lensq): vec3(1.,0.,0.);vec3 T2=cross(Vh,T1);float r=sqrt(r1);float phi=2.0*PI*r2;float t1=r*cos(phi);float t2=r*sin(phi);float s=0.5*(1.0+Vh.z);t2=(1.0-s)*sqrt(1.0-t1*t1)+s*t2;vec3 Nh=t1*T1+t2*T2+sqrt(max(0.0,1.0-t1*t1-t2*t2))*Vh;return normalize(vec3(ax*Nh.x,ay*Nh.y,max(0.0,Nh.z)));}void Onb(const vec3 N,inout vec3 T,inout vec3 B){vec3 up=abs(N.z)<0.9999999 ? vec3(0,0,1): vec3(1,0,0);T=normalize(cross(up,N));B=cross(N,T);}vec3 ToLocal(const vec3 X,const vec3 Y,const vec3 Z,const vec3 V){return vec3(dot(V,X),dot(V,Y),dot(V,Z));}vec3 ToWorld(const vec3 X,const vec3 Y,const vec3 Z,const vec3 V){return V.x*X+V.y*Y+V.z*Z;}vec3 constructGlobalIllumination(vec3 diffuseGi,vec3 specularGi,vec3 viewDir,vec3 viewNormal,vec3 diffuse,vec3 emissive,float roughness,float metalness){roughness*=roughness;vec3 normal=(vec4(viewNormal,0.)*viewMatrix).xyz;vec3 T,B;vec3 v=viewDir;vec3 V=(vec4(v,0.)*viewMatrix).xyz;vec3 N=normal;Onb(N,T,B);V=ToLocal(T,B,N,V);vec3 H=SampleGGXVNDF(V,roughness,roughness,0.25,0.25);if(H.z<0.0)H=-H;vec3 l=normalize(reflect(-V,H));l=ToWorld(T,B,N,l);l=(vec4(l,1.)*cameraMatrixWorld).xyz;l=normalize(l);if(dot(viewNormal,l)<0.)l=-l;vec3 h=normalize(v+l);float VoH=max(EPSILON,dot(v,h));vec3 diffuseColor=diffuseGi;vec3 specularColor=specularGi;vec3 f0=mix(vec3(0.04),diffuse,metalness);vec3 F=F_Schlick(f0,VoH);vec3 diffuseLightingColor=diffuseColor;vec3 diffuseComponent=diffuse*(1.-metalness)*(1.-F)*diffuseLightingColor;vec3 specularLightingColor=specularColor;vec3 specularComponent=specularLightingColor*F;vec3 globalIllumination=diffuseComponent+specularComponent+emissive;return globalIllumination;}' // eslint-disable-line

/* eslint-disable camelcase */
class SSGIComposePass extends Pass {
  constructor(camera) {
    super('SSGIComposePass')
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false,
      type: HalfFloatType
    })
    this.fullscreenMaterial = new ShaderMaterial({
      fragmentShader:
        /* glsl */
        `
            varying vec2 vUv;
            uniform sampler2D depthTexture;
            uniform sampler2D diffuseGiTexture;
            uniform sampler2D specularGiTexture;
            uniform sampler2D directLightTexture;
            uniform mat4 cameraMatrixWorld;
            uniform mat4 projectionMatrix;
            uniform mat4 projectionMatrixInverse;

            #include <common>
            

            ${gbuffer_packing}
            ${ssgi_poisson_compose_functions}

            void main() {
                vec3 diffuse, normal, emissive;
                float roughness, metalness;

                getGData(gBuffersTexture, vUv, diffuse, normal, roughness, metalness, emissive);

                float depth = textureLod(depthTexture, vUv, 0.).r;

                vec3 viewNormal = (vec4(normal, 0.) * cameraMatrixWorld).xyz;

                // view-space position of the current texel
                vec3 viewPos = getViewPosition(depth);
                vec3 viewDir = normalize(viewPos);

                vec3 diffuseGi = textureLod(diffuseGiTexture, vUv, 0.).rgb;
                vec3 specularGi = textureLod(specularGiTexture, vUv, 0.).rgb;

                vec3 gi = constructGlobalIllumination(diffuseGi, specularGi, viewDir, viewNormal, diffuse, emissive, roughness, metalness);

				// gi = diffuseGi;

				#ifdef useDirectLight
				gi += textureLod(directLightTexture, vUv, 0.).rgb;
				#endif

				gl_FragColor = vec4(gi, 1.);
            }
            `,
      vertexShader: vertexShader,
      uniforms: {
        viewMatrix: {
          value: camera.matrixWorldInverse
        },
        cameraMatrixWorld: {
          value: camera.matrixWorld
        },
        projectionMatrix: {
          value: camera.projectionMatrix
        },
        projectionMatrixInverse: {
          value: camera.projectionMatrixInverse
        },
        gBuffersTexture: {
          value: null
        },
        depthTexture: {
          value: null
        },
        diffuseGiTexture: {
          value: null
        },
        specularGiTexture: {
          value: null
        },
        directLightTexture: {
          value: null
        }
      },
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    })
  }

  dispose() {
    this.renderTarget.dispose()
  }

  setSize(width, height) {
    this.renderTarget.setSize(width, height)
  }

  render(renderer) {
    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
  }
}

var ssgi_compose = '#define GLSLIFY 1\nuniform sampler2D inputTexture;uniform sampler2D sceneTexture;uniform sampler2D depthTexture;uniform int toneMapping;\n#include <tonemapping_pars_fragment>\nvoid mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 depthTexel=textureLod(depthTexture,uv,0.);vec3 ssgiClr;if(depthTexel.r==1.0){ssgiClr=textureLod(sceneTexture,uv,0.).rgb;}else{ssgiClr=textureLod(inputTexture,uv,0.).rgb;switch(toneMapping){case 1:ssgiClr=LinearToneMapping(ssgiClr);break;case 2:ssgiClr=ReinhardToneMapping(ssgiClr);break;case 3:ssgiClr=OptimizedCineonToneMapping(ssgiClr);break;case 4:ssgiClr=ACESFilmicToneMapping(ssgiClr);break;case 5:ssgiClr=CustomToneMapping(ssgiClr);break;}ssgiClr*=toneMappingExposure;}outputColor=vec4(ssgiClr,1.0);}' // eslint-disable-line

const { render } = RenderPass.prototype
const globalIblIrradianceDisabledUniform = createGlobalDisableIblIradianceUniform()
const globalIblRadianceDisabledUniform = createGlobalDisableIblRadianceUniform()
class SSGIEffect extends Effect {
  constructor(composer, scene, camera, velocityDepthNormalPass, options) {
    options = { ...defaultSSGIOptions, ...options }
    super('SSGIEffect', ssgi_compose, {
      type: 'FinalSSGIMaterial',
      uniforms: new Map([
        ['inputTexture', new Uniform(null)],
        ['sceneTexture', new Uniform(null)],
        ['depthTexture', new Uniform(null)],
        ['toneMapping', new Uniform(NoToneMapping)]
      ])
    })
    this.selection = new Selection()
    this.isUsingRenderPass = true

    if (!(camera instanceof PerspectiveCamera)) {
      throw new Error(this.constructor.name + " doesn't support cameras of type '" + camera.constructor.name + "' yet. Only cameras of type 'PerspectiveCamera' are supported.")
    }

    this._scene = scene
    this._camera = camera
    this.composer = composer
    if (!composer.depthTexture) composer.createDepthTexture()
    window.depthTexture = composer.depthTexture
    let definesName

    if (options.diffuseOnly) {
      definesName = 'ssdgi'
      options.reprojectSpecular = false
      options.roughnessDependent = false
      options.neighborhoodClamp = false
    } else if (options.specularOnly) {
      definesName = 'ssr'
      options.reprojectSpecular = true
      options.roughnessDependent = true
      options.neighborhoodClamp = true
    } else {
      definesName = 'ssgi'
      options.reprojectSpecular = [false, true]
      options.neighborhoodClamp = [true, true]
      options.roughnessDependent = [false, true]
    }

    options.neighborhoodClampRadius = 2
    options.neighborhoodClampIntensity = 0.75
    const textureCount = options.diffuseOnly || options.specularOnly ? 1 : 2 // options = {
    // 	...options,
    // 	...{
    // 		denoiseCustomComposeShader: denoise_compose,
    // 		denoiseCustomComposeShaderFunctions: denoise_compose_functions
    // 	}
    // }

    this.svgf = new SVGF(scene, camera, velocityDepthNormalPass, textureCount, options) // if (definesName === "ssgi") {
    // 	this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.fragmentShader =
    // 		this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.fragmentShader.replace(
    // 			"accumulatedTexel[ 1 ].rgb = clampedColor;",
    // 			`
    // 				float roughness = inputTexel[ 0 ].a;
    // 				accumulatedTexel[ 1 ].rgb = mix(accumulatedTexel[ 1 ].rgb, clampedColor, 1. - sqrt(roughness));
    // 				`
    // 		)
    // } else if (definesName === "ssr") {
    // 	this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.fragmentShader =
    // 		this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.fragmentShader.replace(
    // 			"accumulatedTexel[ 0 ].rgb = clampedColor;",
    // 			`
    // 			accumulatedTexel[ 0 ].rgb = mix(accumulatedTexel[ 0 ].rgb, clampedColor, 0.5);
    // 			`
    // 		)
    // }

    this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.needsUpdate = true // ssgi pass

    this.ssgiPass = new SSGIPass(this, options)

    if (options.diffuseOnly) {
      this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.inputTexture0.value = this.ssgiPass.texture
    } else if (options.specularOnly) {
      this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.inputTexture0.value = this.ssgiPass.specularTexture
    } else {
      this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.inputTexture0.value = this.ssgiPass.texture
      this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.uniforms.inputTexture1.value = this.ssgiPass.specularTexture
    }

    this.svgf.setJitteredGBuffers(this.ssgiPass.depthTexture, this.ssgiPass.normalTexture, {
      useRoughnessInAlphaChannel: true
    })
    this.svgf.denoisePass.setGBuffersTexture(this.ssgiPass.gBuffersRenderTarget.texture) // patch the denoise pass

    this.svgf.denoisePass.fullscreenMaterial.uniforms = {
      ...this.svgf.denoisePass.fullscreenMaterial.uniforms,
      ...{
        diffuseTexture: new Uniform(null)
      }
    }
    this.svgf.denoisePass.fullscreenMaterial.defines[definesName] = ''
    this.svgf.denoisePass.fullscreenMaterial.uniforms.diffuseTexture.value = this.ssgiPass.diffuseTexture
    this.lastSize = {
      width: options.width,
      height: options.height,
      resolutionScale: options.resolutionScale
    }
    this.sceneRenderTarget = new WebGLRenderTarget(1, 1, {
      colorSpace: SRGBColorSpace
    })
    this.renderPass = new RenderPass(this._scene, this._camera)
    this.renderPass.renderToScreen = false
    this.setSize(options.width, options.height)
    const th = this
    const ssgiRenderPass = this.renderPass // eslint-disable-next-line space-before-function-paren

    RenderPass.prototype.render = function (...args) {
      if (this !== ssgiRenderPass) {
        const wasUsingRenderPass = th.isUsingRenderPass
        th.isUsingRenderPass = true
        if (wasUsingRenderPass != th.isUsingRenderPass) th.updateUsingRenderPass()
      }

      render.call(this, ...args)
    }

    this.ssgiComposePass = new SSGIComposePass(camera)
    this.makeOptionsReactive(options)
  }

  updateUsingRenderPass() {
    if (this.isUsingRenderPass) {
      this.ssgiComposePass.fullscreenMaterial.defines.useDirectLight = ''
    } else {
      delete this.ssgiComposePass.fullscreenMaterial.defines.useDirectLight
    }

    this.ssgiComposePass.fullscreenMaterial.needsUpdate = true
  }

  makeOptionsReactive(options) {
    let needsUpdate = false
    const ssgiPassFullscreenMaterialUniforms = this.ssgiPass.fullscreenMaterial.uniforms
    const ssgiPassFullscreenMaterialUniformsKeys = Object.keys(ssgiPassFullscreenMaterialUniforms)
    const temporalReprojectPass = this.svgf.svgfTemporalReprojectPass

    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, {
        get() {
          return options[key]
        },

        set(value) {
          if (options[key] === value && needsUpdate) return
          options[key] = value

          switch (key) {
            // denoiser
            case 'denoiseIterations':
              this.svgf.denoisePass.iterations = value
              break

            case 'radius':
            case 'phi':
            case 'lumaPhi':
            case 'depthPhi':
            case 'normalPhi':
            case 'roughnessPhi':
            case 'diffusePhi':
              if (this.svgf.denoisePass.fullscreenMaterial.uniforms[key]) {
                this.svgf.denoisePass.fullscreenMaterial.uniforms[key].value = value
                temporalReprojectPass.reset()
              }

              break

            case 'iterations':
            case 'radius':
            case 'rings':
            case 'samples':
              this.svgf.denoisePass[key] = value
              break
            // SSGI

            case 'resolutionScale':
              this.setSize(this.lastSize.width, this.lastSize.height)
              temporalReprojectPass.reset()
              break
            // defines

            case 'spp':
              this.ssgiPass.fullscreenMaterial.fragmentShader = this.ssgiPass.defaultFragmentShader.replaceAll('spp', value)

              if (value !== 1) {
                this.ssgiPass.fullscreenMaterial.fragmentShader = unrollLoops(this.ssgiPass.fullscreenMaterial.fragmentShader.replace('#pragma unroll_loop_start', '').replace('#pragma unroll_loop_end', ''))
              }

              this.ssgiPass.fullscreenMaterial.needsUpdate = needsUpdate
              temporalReprojectPass.reset()
              break

            case 'steps':
            case 'refineSteps':
              this.ssgiPass.fullscreenMaterial.defines[key] = parseInt(value)
              this.ssgiPass.fullscreenMaterial.needsUpdate = needsUpdate
              temporalReprojectPass.reset()
              break

            case 'importanceSampling':
            case 'missedRays':
              if (value) {
                this.ssgiPass.fullscreenMaterial.defines[key] = ''
              } else {
                delete this.ssgiPass.fullscreenMaterial.defines[key]
              }

              this.ssgiPass.fullscreenMaterial.needsUpdate = needsUpdate
              temporalReprojectPass.reset()
              break

            case 'blend':
              this.svgf.svgfTemporalReprojectPass.fullscreenMaterial.uniforms[key].value = value
              temporalReprojectPass.reset()
              break

            case 'distance':
              ssgiPassFullscreenMaterialUniforms.rayDistance.value = value
              temporalReprojectPass.reset()
              break
            // must be a uniform

            default:
              if (ssgiPassFullscreenMaterialUniformsKeys.includes(key)) {
                ssgiPassFullscreenMaterialUniforms[key].value = value
                temporalReprojectPass.reset()
              }
          }
        }
      }) // apply all uniforms and defines

      this[key] = options[key]
    }

    needsUpdate = true
  }

  initialize(renderer, ...args) {
    super.initialize(renderer, ...args)
    this.ssgiPass.initialize(renderer, ...args)
  }

  setSize(width, height, force = false) {
    var _this$cubeToEquirectE

    if (width === undefined && height === undefined) return

    if (!force && width === this.lastSize.width && height === this.lastSize.height && this.resolutionScale === this.lastSize.resolutionScale) {
      return
    }

    this.ssgiPass.setSize(width, height)
    this.svgf.setSize(width, height)
    this.ssgiComposePass.setSize(width, height)
    this.sceneRenderTarget.setSize(width, height)
    ;(_this$cubeToEquirectE = this.cubeToEquirectEnvPass) == null ? void 0 : _this$cubeToEquirectE.setSize(width, height)
    this.lastSize = {
      width,
      height,
      resolutionScale: this.resolutionScale
    }
  }

  dispose() {
    var _this$cubeToEquirectE2

    super.dispose()
    this.ssgiPass.dispose()
    this.svgf.dispose()
    ;(_this$cubeToEquirectE2 = this.cubeToEquirectEnvPass) == null ? void 0 : _this$cubeToEquirectE2.dispose()
    RenderPass.prototype.render = render
  }

  keepEnvMapUpdated(renderer) {
    const ssgiMaterial = this.ssgiPass.fullscreenMaterial
    let environment = this._scene.environment

    if (environment) {
      if (ssgiMaterial.uniforms.envMapInfo.value.mapUuid !== environment.uuid) {
        // if the environment is a cube texture, convert it to an equirectangular texture so we can sample it in the SSGI pass and use MIS
        if (environment.isCubeTexture) {
          if (!this.cubeToEquirectEnvPass) this.cubeToEquirectEnvPass = new CubeToEquirectEnvPass()
          environment = this.cubeToEquirectEnvPass.generateEquirectEnvMap(renderer, environment)
          environment.uuid = this._scene.environment.uuid
        }

        if (!environment.generateMipmaps) {
          environment.generateMipmaps = true
          environment.minFilter = LinearMipMapLinearFilter
          environment.magFilter = LinearFilter
          environment.needsUpdate = true
        }

        ssgiMaterial.uniforms.envMapInfo.value.mapUuid = environment.uuid
        const maxEnvMapMipLevel = getMaxMipLevel(environment)
        ssgiMaterial.uniforms.maxEnvMapMipLevel.value = maxEnvMapMipLevel
        ssgiMaterial.uniforms.envMapInfo.value.map = environment
        ssgiMaterial.defines.USE_ENVMAP = ''
        delete ssgiMaterial.defines.importanceSampling

        if (this.importanceSampling) {
          ssgiMaterial.uniforms.envMapInfo.value.updateFrom(environment, renderer).then(() => {
            ssgiMaterial.defines.importanceSampling = ''
            ssgiMaterial.needsUpdate = true
          })
        } else {
          ssgiMaterial.uniforms.envMapInfo.value.map = environment
        }

        this.svgf.svgfTemporalReprojectPass.reset()
        ssgiMaterial.needsUpdate = true
      }
    } else if ('USE_ENVMAP' in ssgiMaterial.defines) {
      delete ssgiMaterial.defines.USE_ENVMAP
      delete ssgiMaterial.defines.importanceSampling
      ssgiMaterial.needsUpdate = true
    }
  }

  update(renderer, inputBuffer) {
    this.keepEnvMapUpdated(renderer)
    const sceneBuffer = this.isUsingRenderPass ? inputBuffer : this.sceneRenderTarget
    const hideMeshes = []

    if (!this.isUsingRenderPass) {
      const children = []

      for (const c of getVisibleChildren(this._scene)) {
        if (c.isScene) return
        c.visible = !isChildMaterialRenderable(c)
        c.visible ? hideMeshes.push(c) : children.push(c)
      }

      this.renderPass.render(renderer, this.sceneRenderTarget)

      for (const c of children) c.visible = true

      for (const c of hideMeshes) c.visible = false
    }

    this.ssgiComposePass.fullscreenMaterial.uniforms.directLightTexture.value = sceneBuffer.texture
    const ssgiComposePassUniforms = this.ssgiComposePass.fullscreenMaterial.uniforms
    ssgiComposePassUniforms.gBuffersTexture.value = this.ssgiPass.gBuffersRenderTarget.texture
    ssgiComposePassUniforms.depthTexture.value = this.ssgiPass.depthTexture
    ssgiComposePassUniforms.diffuseGiTexture.value = this.svgf.denoisePass.texture[0]
    ssgiComposePassUniforms.specularGiTexture.value = this.svgf.denoisePass.texture[1]
    this.ssgiPass.render(renderer)
    this.svgf.render(renderer)
    this.ssgiComposePass.render(renderer)
    this.uniforms.get('inputTexture').value = this.ssgiComposePass.renderTarget.texture
    this.uniforms.get('sceneTexture').value = sceneBuffer.texture
    this.uniforms.get('depthTexture').value = this.ssgiPass.depthTexture
    this.uniforms.get('toneMapping').value = renderer.toneMapping

    for (const c of hideMeshes) c.visible = true

    const fullGi = !this.diffuseOnly && !this.specularOnly
    globalIblIrradianceDisabledUniform.value = fullGi || this.diffuseOnly === true
    globalIblRadianceDisabledUniform.value = fullGi || this.specularOnly == true
    cancelAnimationFrame(this.rAF2)
    cancelAnimationFrame(this.rAF)
    cancelAnimationFrame(this.usingRenderPassRAF)
    this.rAF = requestAnimationFrame(() => {
      this.rAF2 = requestAnimationFrame(() => {
        globalIblIrradianceDisabledUniform.value = false
        globalIblRadianceDisabledUniform.value = false
      })
    })
    this.usingRenderPassRAF = requestAnimationFrame(() => {
      const wasUsingRenderPass = this.isUsingRenderPass
      this.isUsingRenderPass = false
      if (wasUsingRenderPass != this.isUsingRenderPass) this.updateUsingRenderPass()
    })
  }
}
SSGIEffect.DefaultOptions = defaultSSGIOptions

class SSREffect extends SSGIEffect {
  constructor(composer, scene, camera, velocityDepthNormalPass, options) {
    options = { ...defaultSSGIOptions, ...options }
    options.specularOnly = true
    super(composer, scene, camera, velocityDepthNormalPass, options)
  }
}

class SSDGIEffect extends SSGIEffect {
  constructor(composer, scene, camera, velocityDepthNormalPass, options) {
    options = { ...defaultSSGIOptions, ...options }
    options.diffuseOnly = true
    super(composer, scene, camera, velocityDepthNormalPass, options)
  }
}

var motion_blur =
  '#define GLSLIFY 1\nuniform sampler2D inputTexture;uniform sampler2D velocityTexture;uniform sampler2D blueNoiseTexture;uniform ivec2 blueNoiseSize;uniform vec2 texSize;uniform float intensity;uniform float jitter;uniform float deltaTime;uniform int frame;uvec4 s0,s1;ivec2 pixel;void rng_initialize(vec2 p,int frame){pixel=ivec2(p);s0=uvec4(p,uint(frame),uint(p.x)+uint(p.y));s1=uvec4(frame,frame*15843,frame*31+4566,frame*2345+58585);}void pcg4d(inout uvec4 v){v=v*1664525u+1013904223u;v.x+=v.y*v.w;v.y+=v.z*v.x;v.z+=v.x*v.y;v.w+=v.y*v.z;v=v ^(v>>16u);v.x+=v.y*v.w;v.y+=v.z*v.x;v.z+=v.x*v.y;v.w+=v.y*v.z;}ivec2 shift2(){pcg4d(s1);return(pixel+ivec2(s1.xy % 0x0fffffffu))% blueNoiseSize;}void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){vec4 velocity=textureLod(velocityTexture,vUv,0.0);if(dot(velocity.xyz,velocity.xyz)==0.0){outputColor=inputColor;return;}velocity.xy*=intensity;rng_initialize(vUv*texSize,frame);vec2 blueNoise=texelFetch(blueNoiseTexture,shift2(),0).rg-0.5;vec2 jitterOffset=jitter*velocity.xy*blueNoise;float frameSpeed=(1./100.)/deltaTime;vec2 startUv=vUv+(jitterOffset-velocity.xy*0.5)*frameSpeed;vec2 endUv=vUv+(jitterOffset+velocity.xy*0.5)*frameSpeed;startUv=max(vec2(0.),startUv);endUv=min(vec2(1.),endUv);vec3 motionBlurredColor;for(float i=0.0;i<=samplesFloat;i++){vec2 reprojectedUv=mix(startUv,endUv,i/samplesFloat);vec3 neighborColor=textureLod(inputTexture,reprojectedUv,0.0).rgb;motionBlurredColor+=neighborColor;}motionBlurredColor/=samplesFloat;outputColor=vec4(motionBlurredColor,inputColor.a);}' // eslint-disable-line

/* eslint-disable camelcase */
// http://john-chapman-graphics.blogspot.com/2013/01/per-object-motion-blur.html
// reference code: https://github.com/gkjohnson/threejs-sandbox/blob/master/motionBlurPass/src/CompositeShader.js

const defaultOptions = {
  intensity: 1,
  jitter: 1,
  samples: 16
}
class MotionBlurEffect extends Effect {
  constructor(velocityPass, options = defaultOptions) {
    options = { ...defaultOptions, ...options }
    super('MotionBlurEffect', motion_blur, {
      type: 'MotionBlurMaterial',
      uniforms: new Map([
        ['inputTexture', new Uniform(null)],
        ['velocityTexture', new Uniform(velocityPass.texture)],
        ['blueNoiseTexture', new Uniform(null)],
        ['blueNoiseSize', new Uniform(new Vector2())],
        ['texSize', new Uniform(new Vector2())],
        ['intensity', new Uniform(1)],
        ['jitter', new Uniform(1)],
        ['frame', new Uniform(0)],
        ['deltaTime', new Uniform(0)]
      ]),
      defines: new Map([
        ['samples', options.samples.toFixed(0)],
        ['samplesFloat', options.samples.toFixed(0) + '.0']
      ])
    })
    this.pointsIndex = 0
    this.makeOptionsReactive(options)
  }

  makeOptionsReactive(options) {
    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, {
        get() {
          return options[key]
        },

        set(value) {
          options[key] = value

          switch (key) {
            case 'intensity':
            case 'jitter':
              this.uniforms.get(key).value = value
              break
          }
        }
      })
      this[key] = options[key]
    }
  }

  initialize(renderer, ...args) {
    super.initialize(renderer, ...args)
    new TextureLoader().load(blueNoiseImage, (blueNoiseTexture) => {
      blueNoiseTexture.minFilter = NearestFilter
      blueNoiseTexture.magFilter = NearestFilter
      blueNoiseTexture.wrapS = RepeatWrapping
      blueNoiseTexture.wrapT = RepeatWrapping
      blueNoiseTexture.colorSpace = NoColorSpace
      this.uniforms.get('blueNoiseTexture').value = blueNoiseTexture
    })
  }

  update(renderer, inputBuffer, deltaTime) {
    this.uniforms.get('inputTexture').value = inputBuffer.texture
    this.uniforms.get('deltaTime').value = Math.max(1 / 1000, deltaTime)
    const frame = renderer.info.render.frame % 65536
    this.uniforms.get('frame').value = frame
    this.uniforms.get('texSize').value.set(window.innerWidth, window.innerHeight)
    const noiseTexture = this.uniforms.get('blueNoiseTexture').value

    if (noiseTexture) {
      const { width, height } = noiseTexture.source.data
      this.uniforms.get('blueNoiseSize').value.set(width, height)
    }
  }
}

// this shader is from: https://github.com/gkjohnson/threejs-sandbox
// a second set of bone information from the previous frame

const prev_skinning_pars_vertex =
  /* glsl */
  `
		#ifdef USE_SKINNING
		#ifdef BONE_TEXTURE
			uniform sampler2D prevBoneTexture;
			mat4 getPrevBoneMatrix( const in float i ) {
				float j = i * 4.0;
				float x = mod( j, float( boneTextureSize ) );
				float y = floor( j / float( boneTextureSize ) );
				float dx = 1.0 / float( boneTextureSize );
				float dy = 1.0 / float( boneTextureSize );
				y = dy * ( y + 0.5 );
				vec4 v1 = textureLod( prevBoneTexture, vec2( dx * ( x + 0.5 ), y ), 0. );
				vec4 v2 = textureLod( prevBoneTexture, vec2( dx * ( x + 1.5 ), y ), 0. );
				vec4 v3 = textureLod( prevBoneTexture, vec2( dx * ( x + 2.5 ), y ), 0. );
				vec4 v4 = textureLod( prevBoneTexture, vec2( dx * ( x + 3.5 ), y ), 0. );
				mat4 bone = mat4( v1, v2, v3, v4 );
				return bone;
			}
		#else
			uniform mat4 prevBoneMatrices[ MAX_BONES ];
			mat4 getPrevBoneMatrix( const in float i ) {
				mat4 bone = prevBoneMatrices[ int(i) ];
				return bone;
			}
		#endif
		#endif
`
const velocity_vertex_pars =
  /* glsl */
  `
#define MAX_BONES 64
                    
${ShaderChunk.skinning_pars_vertex}
${prev_skinning_pars_vertex}

uniform mat4 velocityMatrix;
uniform mat4 prevVelocityMatrix;
varying vec4 prevPosition;
varying vec4 newPosition;

#ifdef renderDepth
varying vec2 vHighPrecisionZW;
#endif
` // Returns the body of the vertex shader for the velocity buffer

const velocity_vertex_main =
  /* glsl */
  `
// Get the current vertex position
transformed = vec3( position );
${ShaderChunk.skinning_vertex}
newPosition = velocityMatrix * vec4( transformed, 1.0 );

// Get the previous vertex position
transformed = vec3( position );
${ShaderChunk.skinbase_vertex.replace(/mat4 /g, '').replace(/getBoneMatrix/g, 'getPrevBoneMatrix')}
${ShaderChunk.skinning_vertex.replace(/vec4 /g, '')}
prevPosition = prevVelocityMatrix * vec4( transformed, 1.0 );

gl_Position = newPosition;

#ifdef renderDepth
vHighPrecisionZW = gl_Position.zw;
#endif
`
const velocity_fragment_pars =
  /* glsl */
  `
varying vec4 prevPosition;
varying vec4 newPosition;

#ifdef renderDepth
varying vec2 vHighPrecisionZW;
#endif
`
const velocity_fragment_main =
  /* glsl */
  `
vec2 pos0 = (prevPosition.xy / prevPosition.w) * 0.5 + 0.5;
vec2 pos1 = (newPosition.xy / newPosition.w) * 0.5 + 0.5;

vec2 vel = pos1 - pos0;

#ifdef renderDepth
float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
#endif

gl_FragColor = vec4(vel.x, vel.y, 0., 0.);
`
const velocity_uniforms = {
  prevVelocityMatrix: {
    value: new Matrix4()
  },
  velocityMatrix: {
    value: new Matrix4()
  },
  prevBoneTexture: {
    value: null
  },
  boneTexture: {
    value: null
  },
  normalMap: {
    value: null
  },
  normalScale: {
    value: new Vector2(1, 1)
  },
  uvTransform: {
    value: new Matrix3()
  }
}
class VelocityDepthNormalMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: UniformsUtils.clone(velocity_uniforms),
      vertexShader:
        /* glsl */
        `
					#include <common>
					#include <uv_pars_vertex>
					#include <displacementmap_pars_vertex>
					#include <normal_pars_vertex>
					#include <morphtarget_pars_vertex>
					#include <logdepthbuf_pars_vertex>
					#include <clipping_planes_pars_vertex>

					varying vec2 vUv;

					#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
						varying vec3 vViewPosition;
					#endif
					
                    ${velocity_vertex_pars}
        
                    void main() {
						vec3 transformed;

						#include <uv_vertex>

						#include <skinbase_vertex>
						#include <beginnormal_vertex>
						#include <skinnormal_vertex>
						#include <defaultnormal_vertex>

						#include <morphnormal_vertex>
						#include <normal_vertex>
						#include <morphtarget_vertex>
						#include <displacementmap_vertex>
						#include <project_vertex>
						#include <logdepthbuf_vertex>
						#include <clipping_planes_vertex>

						${velocity_vertex_main}

						#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
							vViewPosition = - mvPosition.xyz;
						#endif

						vUv = uv;

                    }`,
      fragmentShader:
        /* glsl */
        `
					#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( TANGENTSPACE_NORMALMAP )
						varying vec3 vViewPosition;
					#endif

					${velocity_fragment_pars}
					#include <packing>

					#include <uv_pars_fragment>
					#include <normal_pars_fragment>
					#include <normalmap_pars_fragment>

					varying vec2 vUv;

					// source: https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/
					vec2 OctWrap( vec2 v ) {
						vec2 w = 1.0 - abs( v.yx );
						if (v.x < 0.0) w.x = -w.x;
						if (v.y < 0.0) w.y = -w.y;
						return w;
					}

					vec2 encodeOctWrap(vec3 n) {
						n /= (abs(n.x) + abs(n.y) + abs(n.z));
						n.xy = n.z > 0.0 ? n.xy : OctWrap(n.xy);
						n.xy = n.xy * 0.5 + 0.5;
						return n.xy;
					}

					float packNormal(vec3 normal) {
						return uintBitsToFloat(packHalf2x16(encodeOctWrap(normal)));
					}

                    void main() {
						#define vNormalMapUv vUv

						#include <normal_fragment_begin>
                    	#include <normal_fragment_maps>

						${velocity_fragment_main}
						vec3 worldNormal = normalize((vec4(normal, 0.) * viewMatrix).xyz);
						gl_FragColor.b = packNormal(worldNormal);
						gl_FragColor.a = fragCoordZ;
                    }`
    })
    this.isVelocityMaterial = true
  }
}

const backgroundColor = new Color(0)
const zeroVec2 = new Vector2()
const tmpProjectionMatrix = new Matrix4()
const tmpProjectionMatrixInverse = new Matrix4()
class VelocityDepthNormalPass extends Pass {
  constructor(scene, camera, renderDepth = true) {
    super('velocityDepthNormalPass')
    this.cachedMaterials = new WeakMap()
    this.visibleMeshes = []
    this.needsSwap = false

    if (!(camera instanceof PerspectiveCamera)) {
      throw new Error(this.constructor.name + " doesn't support cameras of type '" + camera.constructor.name + "' yet. Only cameras of type 'PerspectiveCamera' are supported.")
    }

    this._scene = scene
    this._camera = camera
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      type: FloatType,
      minFilter: NearestFilter,
      magFilter: NearestFilter
    })
    this.renderTarget.depthTexture = new DepthTexture(1, 1)
    this.renderTarget.depthTexture.type = FloatType
    this.renderDepth = renderDepth
  }

  setVelocityDepthNormalMaterialInScene() {
    this.visibleMeshes = getVisibleChildren(this._scene)

    for (const c of this.visibleMeshes) {
      const originalMaterial = c.material
      let [cachedOriginalMaterial, velocityDepthNormalMaterial] = this.cachedMaterials.get(c) || []

      if (originalMaterial !== cachedOriginalMaterial) {
        var _c$skeleton

        velocityDepthNormalMaterial = new VelocityDepthNormalMaterial()
        copyNecessaryProps(originalMaterial, velocityDepthNormalMaterial)
        c.material = velocityDepthNormalMaterial
        if ((_c$skeleton = c.skeleton) != null && _c$skeleton.boneTexture) saveBoneTexture(c)
        this.cachedMaterials.set(c, [originalMaterial, velocityDepthNormalMaterial])
      }

      c.material = velocityDepthNormalMaterial
      c.visible = isChildMaterialRenderable(c, originalMaterial)
      if (this.renderDepth) velocityDepthNormalMaterial.defines.renderDepth = ''
      keepMaterialMapUpdated(velocityDepthNormalMaterial, originalMaterial, 'normalMap', 'USE_NORMALMAP_TANGENTSPACE', true)
      velocityDepthNormalMaterial.uniforms.normalMap.value = originalMaterial.normalMap
      const map = originalMaterial.map || originalMaterial.normalMap || originalMaterial.roughnessMap || originalMaterial.metalnessMap
      if (map) velocityDepthNormalMaterial.uniforms.uvTransform.value = map.matrix
      updateVelocityDepthNormalMaterialBeforeRender(c, this._camera)
    }
  }

  unsetVelocityDepthNormalMaterialInScene() {
    for (const c of this.visibleMeshes) {
      c.visible = true
      updateVelocityDepthNormalMaterialAfterRender(c, this._camera)
      c.material = this.cachedMaterials.get(c)[0]
    }
  }

  setSize(width, height) {
    var _this$lastVelocityTex

    this.renderTarget.setSize(width, height)
    ;(_this$lastVelocityTex = this.lastVelocityTexture) == null ? void 0 : _this$lastVelocityTex.dispose()
    this.lastVelocityTexture = new FramebufferTexture(width, height, RGBAFormat)
    this.lastVelocityTexture.type = FloatType
    this.lastVelocityTexture.minFilter = NearestFilter
    this.lastVelocityTexture.magFilter = NearestFilter
  }

  dispose() {
    super.dispose()
    this.renderTarget.dispose()
  }

  render(renderer) {
    tmpProjectionMatrix.copy(this._camera.projectionMatrix)
    tmpProjectionMatrixInverse.copy(this._camera.projectionMatrixInverse)
    if (this._camera.view) this._camera.view.enabled = false

    this._camera.updateProjectionMatrix() // in case a RenderPass is not being used, so we need to update the camera's world matrix manually

    this._camera.updateMatrixWorld()

    this.setVelocityDepthNormalMaterialInScene()
    const { background } = this._scene
    this._scene.background = backgroundColor
    renderer.setRenderTarget(this.renderTarget)
    renderer.copyFramebufferToTexture(zeroVec2, this.lastVelocityTexture)
    renderer.render(this._scene, this._camera)
    this._scene.background = background
    this.unsetVelocityDepthNormalMaterialInScene()
    if (this._camera.view) this._camera.view.enabled = true

    this._camera.projectionMatrix.copy(tmpProjectionMatrix)

    this._camera.projectionMatrixInverse.copy(tmpProjectionMatrixInverse)
  }
}

class VelocityPass extends VelocityDepthNormalPass {
  constructor(scene, camera) {
    super(scene, camera, false)
  }
}

class AOPass extends Pass {
  constructor(camera, scene, fragmentShader) {
    super()
    this._camera = camera
    this._scene = scene
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      type: HalfFloatType,
      depthBuffer: false
    })
    const finalFragmentShader = fragmentShader.replace('#include <sampleBlueNoise>', sampleBlueNoise)
    this.fullscreenMaterial = new ShaderMaterial({
      fragmentShader: finalFragmentShader,
      vertexShader,
      uniforms: {
        depthTexture: {
          value: null
        },
        normalTexture: {
          value: null
        },
        cameraNear: {
          value: 0
        },
        cameraFar: {
          value: 0
        },
        viewMatrix: {
          value: this._camera.matrixWorldInverse
        },
        projectionViewMatrix: {
          value: new Matrix4()
        },
        projectionMatrixInverse: {
          value: this._camera.projectionMatrixInverse
        },
        cameraMatrixWorld: {
          value: this._camera.matrixWorld
        },
        texSize: {
          value: new Vector2()
        },
        blueNoiseTexture: {
          value: null
        },
        blueNoiseRepeat: {
          value: new Vector2()
        },
        aoDistance: {
          value: 0
        },
        distancePower: {
          value: 0
        },
        bias: {
          value: 0
        },
        thickness: {
          value: 0
        },
        power: {
          value: 0
        },
        frame: {
          value: 0
        }
      },
      blending: NoBlending,
      depthWrite: false,
      depthTest: false,
      toneMapped: false
    })
    new TextureLoader().load(blueNoiseImage, (blueNoiseTexture) => {
      blueNoiseTexture.minFilter = NearestFilter
      blueNoiseTexture.magFilter = NearestFilter
      blueNoiseTexture.wrapS = RepeatWrapping
      blueNoiseTexture.wrapT = RepeatWrapping
      blueNoiseTexture.colorSpace = NoColorSpace
      this.fullscreenMaterial.uniforms.blueNoiseTexture.value = blueNoiseTexture
    })
  }

  get texture() {
    return this.renderTarget.texture
  }

  setSize(width, height) {
    this.renderTarget.setSize(width, height)
    this.fullscreenMaterial.uniforms.texSize.value.set(this.renderTarget.width, this.renderTarget.height)
  }

  render(renderer) {
    const spp = +this.fullscreenMaterial.defines.spp
    this.fullscreenMaterial.uniforms.frame.value = (this.fullscreenMaterial.uniforms.frame.value + spp) % 65536
    this.fullscreenMaterial.uniforms.cameraNear.value = this._camera.near
    this.fullscreenMaterial.uniforms.cameraFar.value = this._camera.far
    this.fullscreenMaterial.uniforms.projectionViewMatrix.value.multiplyMatrices(this._camera.projectionMatrix, this._camera.matrixWorldInverse)
    const noiseTexture = this.fullscreenMaterial.uniforms.blueNoiseTexture.value

    if (noiseTexture) {
      const { width, height } = noiseTexture.source.data
      this.fullscreenMaterial.uniforms.blueNoiseRepeat.value.set(this.renderTarget.width / width, this.renderTarget.height / height)
    }

    renderer.setRenderTarget(this.renderTarget)
    renderer.render(this.scene, this.camera)
  }
}

var hbao_utils =
  '#define GLSLIFY 1\n#include <sampleBlueNoise>\nuniform sampler2D normalTexture;uniform float cameraNear;uniform float cameraFar;uniform mat4 projectionMatrixInverse;uniform mat4 cameraMatrixWorld;float getViewZ(const float depth){\n#ifdef PERSPECTIVE_CAMERA\nreturn perspectiveDepthToViewZ(depth,cameraNear,cameraFar);\n#else\nreturn orthographicDepthToViewZ(depth,cameraNear,cameraFar);\n#endif\n}vec3 getWorldPos(const float depth,const vec2 coord){float z=depth*2.0-1.0;vec4 clipSpacePosition=vec4(coord*2.0-1.0,z,1.0);vec4 viewSpacePosition=projectionMatrixInverse*clipSpacePosition;vec4 worldSpacePosition=cameraMatrixWorld*viewSpacePosition;worldSpacePosition.xyz/=worldSpacePosition.w;return worldSpacePosition.xyz;}vec3 slerp(const vec3 a,const vec3 b,const float t){float cosAngle=dot(a,b);float angle=acos(cosAngle);if(abs(angle)<0.001){return mix(a,b,t);}float sinAngle=sin(angle);float t1=sin((1.0-t)*angle)/sinAngle;float t2=sin(t*angle)/sinAngle;return(a*t1)+(b*t2);}vec3 computeWorldNormal(){vec2 size=vec2(textureSize(depthTexture,0));ivec2 p=ivec2(vUv*size);float c0=texelFetch(depthTexture,p,0).x;float l2=texelFetch(depthTexture,p-ivec2(2,0),0).x;float l1=texelFetch(depthTexture,p-ivec2(1,0),0).x;float r1=texelFetch(depthTexture,p+ivec2(1,0),0).x;float r2=texelFetch(depthTexture,p+ivec2(2,0),0).x;float b2=texelFetch(depthTexture,p-ivec2(0,2),0).x;float b1=texelFetch(depthTexture,p-ivec2(0,1),0).x;float t1=texelFetch(depthTexture,p+ivec2(0,1),0).x;float t2=texelFetch(depthTexture,p+ivec2(0,2),0).x;float dl=abs((2.0*l1-l2)-c0);float dr=abs((2.0*r1-r2)-c0);float db=abs((2.0*b1-b2)-c0);float dt=abs((2.0*t1-t2)-c0);vec3 ce=getWorldPos(c0,vUv).xyz;vec3 dpdx=(dl<dr)? ce-getWorldPos(l1,(vUv-vec2(1.0/size.x,0.0))).xyz:-ce+getWorldPos(r1,(vUv+vec2(1.0/size.x,0.0))).xyz;vec3 dpdy=(db<dt)? ce-getWorldPos(b1,(vUv-vec2(0.0,1.0/size.y))).xyz:-ce+getWorldPos(t1,(vUv+vec2(0.0,1.0/size.y))).xyz;return normalize(cross(dpdx,dpdy));}vec3 getWorldNormal(const vec2 uv){\n#ifdef useNormalTexture\nvec3 worldNormal=unpackRGBToNormal(textureLod(normalTexture,uv,0.).rgb);worldNormal=(vec4(worldNormal,1.)*viewMatrix).xyz;return normalize(worldNormal);\n#else\nreturn computeWorldNormal();\n#endif\n}\n#define PI 3.14159265358979323846264338327950288\nvec3 cosineSampleHemisphere(const vec3 n,const vec2 u){float r=sqrt(u.x);float theta=2.0*PI*u.y;vec3 b=normalize(cross(n,vec3(0.0,1.0,1.0)));vec3 t=cross(b,n);return normalize(r*sin(theta)*b+sqrt(1.0-u.x)*n+r*cos(theta)*t);}' // eslint-disable-line

var fragmentShader$1 =
  '#define GLSLIFY 1\nvarying vec2 vUv;uniform sampler2D depthTexture;uniform mat4 projectionViewMatrix;uniform int frame;uniform sampler2D blueNoiseTexture;uniform vec2 blueNoiseRepeat;uniform vec2 texSize;uniform float aoDistance;uniform float distancePower;uniform float bias;uniform float thickness;\n#include <packing>\n#include <hbao_utils>\nfloat getOcclusion(const vec3 cameraPosition,const vec3 worldPos,const vec3 worldNormal,const float depth,const int seed,inout float totalWeight){vec4 blueNoise=sampleBlueNoise(blueNoiseTexture,seed,blueNoiseRepeat,texSize);vec3 sampleWorldDir=cosineSampleHemisphere(worldNormal,blueNoise.rg);vec3 sampleWorldPos=worldPos+aoDistance*pow(blueNoise.b,distancePower+1.0)*sampleWorldDir;vec4 sampleUv=projectionViewMatrix*vec4(sampleWorldPos,1.);sampleUv.xy/=sampleUv.w;sampleUv.xy=sampleUv.xy*0.5+0.5;float sampleDepth=textureLod(depthTexture,sampleUv.xy,0.0).r;float deltaDepth=depth-sampleDepth;float d=distance(sampleWorldPos,cameraPosition);deltaDepth*=0.001*d*d;float th=thickness*0.01;float theta=dot(worldNormal,sampleWorldDir);totalWeight+=theta;if(deltaDepth<th){float horizon=sampleDepth+deltaDepth*bias*1000.;float occlusion=max(0.0,horizon-depth)*theta;float m=max(0.,1.-deltaDepth/th);occlusion=10.*occlusion*m/d;occlusion=sqrt(occlusion);return occlusion;}return 0.;}void main(){float depth=textureLod(depthTexture,vUv,0.0).r;if(depth==1.0){discard;return;}vec4 cameraPosition=cameraMatrixWorld*vec4(0.0,0.0,0.0,1.0);vec3 worldPos=getWorldPos(depth,vUv);vec3 worldNormal=getWorldNormal(vUv);float ao=0.0,totalWeight=0.0;for(int i=0;i<spp;i++){int seed=i;\n#ifdef animatedNoise\nseed+=frame;\n#endif\nfloat occlusion=getOcclusion(cameraPosition.xyz,worldPos,worldNormal,depth,seed,totalWeight);ao+=occlusion;}if(totalWeight>0.)ao/=totalWeight;ao=clamp(1.-ao,0.,1.);gl_FragColor=vec4(worldNormal,ao);}' // eslint-disable-line

const finalFragmentShader = fragmentShader$1.replace('#include <hbao_utils>', hbao_utils)

class HBAOPass extends AOPass {
  constructor(camera, scene) {
    super(camera, scene, finalFragmentShader)
  }
}

var ao_compose = '#define GLSLIFY 1\nuniform sampler2D inputTexture;uniform sampler2D depthTexture;uniform float power;uniform vec3 color;void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){float unpackedDepth=textureLod(depthTexture,uv,0.).r;float ao=unpackedDepth>0.9999 ? 1.0 : textureLod(inputTexture,uv,0.0).a;ao=pow(ao,power);vec3 aoColor=mix(color,vec3(1.),ao);aoColor*=inputColor.rgb;outputColor=vec4(aoColor,inputColor.a);}' // eslint-disable-line

const defaultAOOptions = {
  resolutionScale: 1,
  spp: 8,
  distance: 2,
  distancePower: 1,
  power: 2,
  bias: 40,
  thickness: 0.075,
  color: new Color('black'),
  useNormalPass: false,
  velocityDepthNormalPass: null,
  normalTexture: null,
  ...PoissionDenoisePass.DefaultOptions
}

class AOEffect extends Effect {
  constructor(composer, camera, scene, aoPass, options = defaultAOOptions) {
    super('AOEffect', ao_compose, {
      type: 'FinalAOMaterial',
      uniforms: new Map([
        ['inputTexture', new Uniform(null)],
        ['depthTexture', new Uniform(null)],
        ['power', new Uniform(0)],
        ['color', new Uniform(new Color('black'))]
      ])
    })
    this.lastSize = {
      width: 0,
      height: 0,
      resolutionScale: 0
    }
    this.composer = composer
    this.aoPass = aoPass
    options = { ...defaultAOOptions, ...options } // set up depth texture

    if (!composer.depthTexture) composer.createDepthTexture()
    this.aoPass.fullscreenMaterial.uniforms.depthTexture.value = composer.depthTexture
    this.uniforms.get('depthTexture').value = composer.depthTexture // set up optional normal texture

    if (options.useNormalPass || options.normalTexture) {
      var _options$normalTextur

      if (options.useNormalPass) this.normalPass = new NormalPass(scene, camera)
      const normalTexture = (_options$normalTextur = options.normalTexture) !== null && _options$normalTextur !== void 0 ? _options$normalTextur : this.normalPass.texture
      this.aoPass.fullscreenMaterial.uniforms.normalTexture.value = normalTexture
      this.aoPass.fullscreenMaterial.defines.useNormalTexture = ''
    }

    this.poissionDenoisePass = new PoissionDenoisePass(camera, this.aoPass.texture, composer.depthTexture, {
      normalInRgb: true
    })
    this.makeOptionsReactive(options)
  }

  makeOptionsReactive(options) {
    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, {
        get() {
          return options[key]
        },

        set(value) {
          if (value === null || value === undefined) return
          options[key] = value

          switch (key) {
            case 'spp':
              this.aoPass.fullscreenMaterial.defines.spp = value.toFixed(0)
              this.aoPass.fullscreenMaterial.needsUpdate = true
              break

            case 'distance':
              this.aoPass.fullscreenMaterial.uniforms.aoDistance.value = value
              break

            case 'resolutionScale':
              this.setSize(this.lastSize.width, this.lastSize.height)
              break

            case 'power':
              this.uniforms.get('power').value = value
              break

            case 'color':
              this.uniforms.get('color').value.copy(new Color(value))
              break
            // denoiser

            case 'iterations':
            case 'radius':
            case 'rings':
            case 'samples':
              this.poissionDenoisePass[key] = value
              break

            case 'lumaPhi':
            case 'depthPhi':
            case 'normalPhi':
              this.poissionDenoisePass.fullscreenMaterial.uniforms[key].value = Math.max(value, 0.0001)
              break

            default:
              if (key in this.aoPass.fullscreenMaterial.uniforms) {
                this.aoPass.fullscreenMaterial.uniforms[key].value = value
              }
          }
        },

        configurable: true
      }) // apply all uniforms and defines

      this[key] = options[key]
    }
  }

  setSize(width, height) {
    var _this$normalPass

    if (width === undefined || height === undefined) return

    if (width === this.lastSize.width && height === this.lastSize.height && this.resolutionScale === this.lastSize.resolutionScale) {
      return
    }

    ;(_this$normalPass = this.normalPass) == null ? void 0 : _this$normalPass.setSize(width, height)
    this.aoPass.setSize(width * this.resolutionScale, height * this.resolutionScale)
    this.poissionDenoisePass.setSize(width, height)
    this.lastSize = {
      width,
      height,
      resolutionScale: this.resolutionScale
    }
  }

  get texture() {
    if (this.iterations > 0) {
      return this.poissionDenoisePass.texture
    }

    return this.aoPass.texture
  }

  update(renderer) {
    var _this$normalPass2

    // check if TRAA is being used so we can animate the noise
    const hasTRAA = this.composer.passes.some((pass) => {
      var _pass$effects

      return pass.enabled && !pass.skipRendering && ((_pass$effects = pass.effects) == null ? void 0 : _pass$effects.some((effect) => effect instanceof TRAAEffect))
    }) // set animated noise depending on TRAA

    if (hasTRAA && !('animatedNoise' in this.aoPass.fullscreenMaterial.defines)) {
      this.aoPass.fullscreenMaterial.defines.animatedNoise = ''
      this.aoPass.fullscreenMaterial.needsUpdate = true
    } else if (!hasTRAA && 'animatedNoise' in this.aoPass.fullscreenMaterial.defines) {
      delete this.aoPass.fullscreenMaterial.defines.animatedNoise
      this.aoPass.fullscreenMaterial.needsUpdate = true
    }

    this.uniforms.get('inputTexture').value = this.texture
    ;(_this$normalPass2 = this.normalPass) == null ? void 0 : _this$normalPass2.render(renderer)
    this.aoPass.render(renderer)
    this.poissionDenoisePass.render(renderer)
  }
}

AOEffect.DefaultOptions = defaultAOOptions

class HBAOEffect extends AOEffect {
  constructor(composer, camera, scene, options = AOEffect.DefaultOptions) {
    const hbaoPass = new HBAOPass(camera, scene)
    options = { ...AOEffect.DefaultOptions, ...HBAOEffect.DefaultOptions, ...options }
    super(composer, camera, scene, hbaoPass, options)
    this.lastSize = {
      width: 0,
      height: 0,
      resolutionScale: 0
    }
    options = { ...AOEffect.DefaultOptions, ...options }
  }
}

var fragmentShader =
  '#define GLSLIFY 1\nvarying vec2 vUv;uniform sampler2D depthTexture;uniform sampler2D normalTexture;uniform mat4 projectionViewMatrix;uniform mat4 cameraMatrixWorld;uniform sampler2D blueNoiseTexture;uniform vec2 blueNoiseRepeat;uniform vec2 texSize;uniform mat4 projectionMatrixInverse;uniform float aoDistance;uniform float distancePower;uniform float cameraNear;uniform float cameraFar;uniform int frame;uniform vec3[spp]samples;uniform float[spp]samplesR;\n#include <common>\n#include <packing>\n#include <sampleBlueNoise>\nvec3 getWorldPos(const float depth,const vec2 coord){float z=depth*2.0-1.0;vec4 clipSpacePosition=vec4(coord*2.0-1.0,z,1.0);vec4 viewSpacePosition=projectionMatrixInverse*clipSpacePosition;vec4 worldSpacePosition=cameraMatrixWorld*viewSpacePosition;worldSpacePosition.xyz/=worldSpacePosition.w;return worldSpacePosition.xyz;}vec3 computeNormal(vec3 worldPos,vec2 vUv){vec2 size=vec2(textureSize(depthTexture,0));ivec2 p=ivec2(vUv*size);float c0=texelFetch(depthTexture,p,0).x;float l2=texelFetch(depthTexture,p-ivec2(2,0),0).x;float l1=texelFetch(depthTexture,p-ivec2(1,0),0).x;float r1=texelFetch(depthTexture,p+ivec2(1,0),0).x;float r2=texelFetch(depthTexture,p+ivec2(2,0),0).x;float b2=texelFetch(depthTexture,p-ivec2(0,2),0).x;float b1=texelFetch(depthTexture,p-ivec2(0,1),0).x;float t1=texelFetch(depthTexture,p+ivec2(0,1),0).x;float t2=texelFetch(depthTexture,p+ivec2(0,2),0).x;float dl=abs((2.0*l1-l2)-c0);float dr=abs((2.0*r1-r2)-c0);float db=abs((2.0*b1-b2)-c0);float dt=abs((2.0*t1-t2)-c0);vec3 ce=getWorldPos(c0,vUv).xyz;vec3 dpdx=(dl<dr)? ce-getWorldPos(l1,(vUv-vec2(1.0/size.x,0.0))).xyz:-ce+getWorldPos(r1,(vUv+vec2(1.0/size.x,0.0))).xyz;vec3 dpdy=(db<dt)? ce-getWorldPos(b1,(vUv-vec2(0.0,1.0/size.y))).xyz:-ce+getWorldPos(t1,(vUv+vec2(0.0,1.0/size.y))).xyz;return normalize(cross(dpdx,dpdy));}highp float linearize_depth(highp float d,highp float zNear,highp float zFar){highp float z_n=2.0*d-1.0;return 2.0*zNear*zFar/(zFar+zNear-z_n*(zFar-zNear));}void main(){float depth=textureLod(depthTexture,vUv,0.).x;if(depth==1.0){discard;return;}vec3 worldPos=getWorldPos(depth,vUv);vec3 normal=computeNormal(worldPos,vUv);\n#ifdef animatedNoise\nint seed=frame;\n#else\nint seed=0;\n#endif\nvec4 noise=sampleBlueNoise(blueNoiseTexture,seed,blueNoiseRepeat,texSize);vec3 randomVec=normalize(noise.rgb*2.0-1.0);vec3 tangent=normalize(randomVec-normal*dot(randomVec,normal));vec3 bitangent=cross(normal,tangent);mat3 tbn=mat3(tangent,bitangent,normal);float occluded=0.0;float totalWeight=0.0;vec3 samplePos;float sppF=float(spp);for(float i=0.0;i<sppF;i++){vec3 sampleDirection=tbn*samples[int(i)];if(dot(sampleDirection,normal)<0.0)sampleDirection*=-1.0;float moveAmt=samplesR[int(mod(i+noise.a*sppF,sppF))];samplePos=worldPos+aoDistance*moveAmt*sampleDirection;vec4 offset=projectionViewMatrix*vec4(samplePos,1.0);offset.xyz/=offset.w;offset.xyz=offset.xyz*0.5+0.5;float sampleDepth=textureLod(depthTexture,offset.xy,0.0).x;float distSample=linearize_depth(sampleDepth,cameraNear,cameraFar);float distWorld=linearize_depth(offset.z,cameraNear,cameraFar);float rangeCheck=smoothstep(0.0,1.0,aoDistance/(aoDistance*abs(distSample-distWorld)));rangeCheck=pow(rangeCheck,distancePower);float weight=dot(sampleDirection,normal);occluded+=rangeCheck*weight*(distSample<distWorld ? 1.0 : 0.0);totalWeight+=weight;}float occ=clamp(1.0-occluded/totalWeight,0.0,1.0);gl_FragColor=vec4(normal,occ);}' // eslint-disable-line

class SSAOPass extends AOPass {
  constructor(camera, scene) {
    super(camera, scene, fragmentShader)
  }
}

function getPointsOnSphere(n) {
  const points = []
  const inc = Math.PI * (3 - Math.sqrt(5))
  const off = 2 / n

  for (let k = 0; k < n; k++) {
    const y = k * off - 1 + off / 2
    const r = Math.sqrt(1 - y * y)
    const phi = k * inc
    points.push(new Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r))
  }

  return points
}

class SSAOEffect extends AOEffect {
  constructor(composer, camera, scene, options = {}) {
    SSAOEffect.DefaultOptions = {
      ...AOEffect.DefaultOptions,
      ...{
        spp: 16,
        distance: 1,
        distancePower: 0.25,
        power: 2
      }
    }
    options = { ...SSAOEffect.DefaultOptions, ...options }
    const aoPass = new SSAOPass(camera, scene)
    super(composer, camera, scene, aoPass, options)
  }

  makeOptionsReactive(options) {
    super.makeOptionsReactive(options)

    for (const key of ['spp']) {
      Object.defineProperty(this, key, {
        get() {
          return options[key]
        },

        set(value) {
          if (value === null || value === undefined) return
          options[key] = value

          switch (key) {
            case 'spp':
              this.aoPass.fullscreenMaterial.defines.spp = value.toFixed(0)
              const samples = getPointsOnSphere(value)
              const samplesR = []

              for (let i = 0; i < value; i++) {
                samplesR.push((i + 1) / value)
              }

              this.aoPass.fullscreenMaterial.uniforms.samples = {
                value: samples
              }
              this.aoPass.fullscreenMaterial.uniforms.samplesR = {
                value: samplesR
              }
              this.aoPass.fullscreenMaterial.needsUpdate = true
              break
          }
        },

        configurable: true
      })
    }

    this.spp = options['spp']
  }
}

export { HBAOEffect, MotionBlurEffect, PoissionDenoisePass, SSAOEffect, SSDGIEffect, SSGIEffect, SSREffect, SVGF, TRAAEffect, TemporalReprojectPass, VelocityDepthNormalPass, VelocityPass }
