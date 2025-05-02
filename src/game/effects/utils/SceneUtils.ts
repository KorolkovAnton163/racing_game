import * as THREE from "three";

export const isGroundProjectedEnv = c => {
  return c.material.fragmentShader?.includes(
      "float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );"
  )
}

export const isChildMaterialRenderable = (c: THREE.Mesh, material: THREE.Material = c.material as THREE.Material): boolean => {
  return (
      material.visible &&
      material.depthWrite &&
      material.depthTest &&
      (!material.transparent || material.opacity > 0) &&
      !isGroundProjectedEnv(c)
  )
}

export const didCameraMove = (camera, lastCameraPosition, lastCameraQuaternion) => {
  if (camera.position.distanceToSquared(lastCameraPosition) > 0.000001) {
    return true
  }

  if (camera.quaternion.angleTo(lastCameraQuaternion) > 0.001) {
    return true
  }

  return false
}

export const getVisibleChildren = (object: THREE.Object3D): THREE.Mesh[] => {
  const queue: THREE.Object3D[] = [object]
  const objects: THREE.Mesh[] = []

  while (queue.length !== 0) {
    const mesh = queue.shift()
    if (mesh instanceof THREE.Mesh && mesh.material) {
      objects.push(mesh as THREE.Mesh);
    }

    for (const c of mesh.children) {
      if (c.visible) queue.push(c);
    }
  }

  return objects
}
