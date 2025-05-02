import * as THREE from "three";
import VelocityDepthNormalMaterial from "../../temporal-reproject/material/VelocityDepthNormalMaterial";

export const materialProps = [
  "vertexTangent",
  "vertexColors",
  "vertexAlphas",
  "vertexUvs",
  "uvsVertexOnly",
  "supportsVertexTextures",
  "instancing",
  "instancingColor",
  "side",
  "flatShading",
  "skinning",
  "doubleSided",
  "flipSided"
]

export const copyNecessaryProps = (originalMaterial, newMaterial) => {
  for (const props of materialProps) newMaterial[props] = originalMaterial[props]
}

export const keepMaterialMapUpdated = (
    mrtMaterial: VelocityDepthNormalMaterial,
    originalMaterial: THREE.Material,
    prop: string,
    define: string,
    useKey: boolean
) => {
  if (useKey) {
    if (originalMaterial[prop] !== mrtMaterial[prop]) {
      mrtMaterial[prop] = originalMaterial[prop]
      mrtMaterial.uniforms[prop].value = originalMaterial[prop]

      if (originalMaterial[prop]) {
        mrtMaterial.defines[define] = ""
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
