import {
  Fn,
  Loop,
  float,
  vec2,
  vec3,
  vec4,
  refract,
  normalize,
  length,
  clamp,
  log,
  log2,
  exp,
  mix,
  pow,
  max,
  min,
  abs,
  select,
  div,
  int,
  cross,
  dFdx,
  dFdy,
  screenCoordinate,
  screenSize,
  cameraPosition,
  cameraViewMatrix,
  cameraProjectionMatrix,
  modelWorldMatrix,
  normalWorld,
  positionWorld,
  diffuseColor,
  specularColor,
  specularF90,
  metalness,
  roughness,
  triNoise3D,
  DFGLUT,
  dispersion,
  interleavedGradientNoise,
  vogelDiskSample,
} from "three/tsl";

const MAX_TRANSMISSION_SAMPLES = 16;
const PI2 = 6.28318530718;

const getVolumeTransmissionRay = Fn(
  ([n, v, thicknessVal, iorVal, modelMatrix]) => {
    const refractionVector = vec3(
      refract(v.negate(), normalize(n), div(1.0, iorVal)),
    );
    const modelScale = vec3(
      length(modelMatrix[0].xyz),
      length(modelMatrix[1].xyz),
      length(modelMatrix[2].xyz),
    );
    return normalize(refractionVector).mul(thicknessVal.mul(modelScale));
  },
).setLayout({
  name: "getVolumeTransmissionRay",
  type: "vec3",
  inputs: [
    { name: "n", type: "vec3" },
    { name: "v", type: "vec3" },
    { name: "thicknessVal", type: "float" },
    { name: "iorVal", type: "float" },
    { name: "modelMatrix", type: "mat4" },
  ],
});

const applyIorToRoughness = Fn(([roughnessVal, iorVal]) =>
  roughnessVal.mul(clamp(iorVal.mul(2.0).sub(2.0), 0.0, 1.0)),
).setLayout({
  name: "applyIorToRoughness",
  type: "float",
  inputs: [
    { name: "roughnessVal", type: "float" },
    { name: "iorVal", type: "float" },
  ],
});

const volumeAttenuation = Fn(
  ([transmissionDistance, attColor, attDistance]) => {
    const attenuationCoefficient = log(attColor).negate().div(attDistance);
    const transmittance = exp(
      attenuationCoefficient.negate().mul(transmissionDistance),
    );
    return select(attDistance.notEqual(0.0), transmittance, vec3(1.0));
  },
).setLayout({
  name: "volumeAttenuation",
  type: "vec3",
  inputs: [
    { name: "transmissionDistance", type: "float" },
    { name: "attColor", type: "vec3" },
    { name: "attDistance", type: "float" },
  ],
});

const refractionCoordsFor = Fn(
  ([
    n,
    v,
    iorVal,
    thicknessVal,
    position,
    modelMatrix,
    viewMatrix,
    projMatrix,
  ]) => {
    const transmissionRay = getVolumeTransmissionRay(
      n,
      v,
      thicknessVal,
      iorVal,
      modelMatrix,
    );
    const refractedRayExit = position.add(transmissionRay);
    const ndcPos = projMatrix.mul(viewMatrix.mul(vec4(refractedRayExit, 1.0)));
    const coords = vec2(ndcPos.xy.div(ndcPos.w)).toVar();
    coords.addAssign(1.0);
    coords.divAssign(2.0);
    coords.assign(vec2(coords.x, coords.y.oneMinus()));
    return coords;
  },
);

function backdropFootprintLod(coords) {
  const coordsPx = coords.mul(screenSize);
  const footprint = max(length(dFdx(coordsPx)), length(dFdy(coordsPx)));
  return log2(max(footprint, 1.0));
}

function createGetTransmissionSample(backdropTextureNode) {
  return Fn(([fragCoord, roughnessVal, iorVal, minLod]) => {
    const roughnessLod = applyIorToRoughness(roughnessVal, iorVal);
    const lod = max(log2(screenSize.x).mul(roughnessLod), minLod);
    return backdropTextureNode.sample(fragCoord).level(lod);
  });
}

function createRefractSample(getTransmissionSample) {
  return Fn(
    ([
      n,
      v,
      roughnessVal,
      iorVal,
      thicknessVal,
      position,
      modelMatrix,
      viewMatrix,
      projMatrix,
      minLod,
    ]) => {
      const coords = refractionCoordsFor(
        n,
        v,
        iorVal,
        thicknessVal,
        position,
        modelMatrix,
        viewMatrix,
        projMatrix,
      );

      return getTransmissionSample(coords, roughnessVal, iorVal, minLod);
    },
  );
}

export function createMtmVolumeRefraction(
  backdropTextureNode,
  uniforms,
  requestedSamples = 10,
) {
  const samples = Math.min(
    MAX_TRANSMISSION_SAMPLES,
    Math.max(1, Math.round(requestedSamples)),
  );

  const getTransmissionSample =
    createGetTransmissionSample(backdropTextureNode);
  const refractSample = createRefractSample(getTransmissionSample);

  return Fn(() => {
    const n = normalWorld;
    const position = positionWorld;
    const v = cameraPosition.sub(positionWorld).normalize();
    const roughnessVal = roughness;
    const diffuse = diffuseColor;
    const specColor = mix(specularColor, diffuseColor.rgb, metalness);
    const specF90 = specularF90;
    const modelMatrix = modelWorldMatrix;
    const viewMatrix = cameraViewMatrix;
    const projMatrix = cameraProjectionMatrix;
    const iorVal = uniforms.ior;
    const thicknessVal = uniforms.thickness;
    const attColor = uniforms.attenuationColor;
    const attDistance = uniforms.attenuationDistance;
    const sampleCount = float(samples);

    const transmissionAccum = vec3(0.0).toVar();
    const randomCoords = interleavedGradientNoise(screenCoordinate.xy);
    const phi = interleavedGradientNoise(
      screenCoordinate.xy.add(vec2(17.0, 31.0)),
    ).mul(PI2);

    const thicknessSmear = thicknessVal.mul(
      max(pow(roughnessVal, 0.33), uniforms.anisotropicBlur),
    );

    const edgeFactor = pow(float(1).sub(n.dot(v).clamp()), float(2.0));
    const edgeThicknessBoost = thicknessVal.mul(edgeFactor.mul(0.55));

    const distortionAmt = uniforms.distortion;
    const temporalOffset = vec3(
      uniforms.time,
      uniforms.time.negate(),
      uniforms.time.negate(),
    ).mul(uniforms.temporalDistortion);
    const noisePos = position.mul(uniforms.distortionScale).add(temporalOffset);
    const distortionNormal = distortionAmt
      .mul(float(0.15).add(edgeFactor.mul(0.85)))
      .mul(
        vec3(
          triNoise3D(noisePos, float(0.2), uniforms.time),
          triNoise3D(noisePos.zxy, float(0.2), uniforms.time),
          triNoise3D(noisePos.yxz, float(0.2), uniforms.time),
        ),
      );

    const halfSpread = iorVal.sub(1.0).mul(dispersion.mul(0.025));
    const iorR = iorVal.sub(halfSpread);
    const iorG = iorVal;
    const iorB = iorVal.add(halfSpread);

    // Silhouette pixels see huge screen-space derivatives. Capping the level keeps their blurry mips from
    // bleeding into the glass, which would shimmer as the camera moves.
    const refractionLod = min(
      backdropFootprintLod(
        refractionCoordsFor(
          n,
          v,
          iorVal,
          thicknessVal,
          position,
          modelMatrix,
          viewMatrix,
          projMatrix,
        ),
      ),
      float(1.5),
    );

    const basisUp = abs(n.z)
      .lessThan(0.999)
      .select(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0));
    const tangent = normalize(cross(basisUp, n));
    const bitangent = cross(n, tangent);
    const roughnessScale = roughnessVal.mul(roughnessVal).mul(2.0);

    Loop(
      {
        start: 0,
        end: samples,
        type: "float",
        condition: "<",
      },
      ({ i }) => {
        const disk = vogelDiskSample(int(i), int(samples), phi);
        const jitter = tangent.mul(disk.x).add(bitangent.mul(disk.y));

        const sampleNorm = normalize(
          n.add(roughnessScale.mul(jitter)).add(distortionNormal),
        );

        const sampleOffset = i.add(randomCoords).div(sampleCount);
        const sampleThickness = thicknessVal
          .add(thicknessSmear.mul(sampleOffset))
          .add(edgeThicknessBoost);

        const sampleR = refractSample(
          sampleNorm,
          v,
          roughnessVal,
          iorR,
          sampleThickness,
          position,
          modelMatrix,
          viewMatrix,
          projMatrix,
          refractionLod,
        ).r;

        const sampleG = refractSample(
          sampleNorm,
          v,
          roughnessVal,
          iorG,
          sampleThickness,
          position,
          modelMatrix,
          viewMatrix,
          projMatrix,
          refractionLod,
        ).g;

        const sampleB = refractSample(
          sampleNorm,
          v,
          roughnessVal,
          iorB,
          sampleThickness,
          position,
          modelMatrix,
          viewMatrix,
          projMatrix,
          refractionLod,
        ).b;

        transmissionAccum.addAssign(vec3(sampleR, sampleG, sampleB));
      },
    );

    transmissionAccum.divAssign(sampleCount);

    const transmissionRay = getVolumeTransmissionRay(
      n,
      v,
      thicknessVal,
      iorVal,
      modelMatrix,
    );
    const attenuatedColor = diffuse
      .mul(volumeAttenuation(length(transmissionRay), attColor, attDistance))
      .mul(transmissionAccum);

    const dotNV = n.dot(v).clamp();
    const fab = DFGLUT({ dotNV, roughness: roughnessVal });
    const F = specColor.mul(fab.x).add(specF90.mul(fab.y));

    const rgb = F.oneMinus().mul(attenuatedColor);
    return vec4(rgb.x, rgb.y, rgb.z, float(1.0));
  });
}

export function buildTransmissionBackdropNode(
  backdropTextureNode,
  uniforms,
  requestedSamples = 10,
) {
  if (!backdropTextureNode) return null;

  const mtmVolumeRefraction = createMtmVolumeRefraction(
    backdropTextureNode,
    uniforms,
    requestedSamples,
  );

  return mtmVolumeRefraction();
}
