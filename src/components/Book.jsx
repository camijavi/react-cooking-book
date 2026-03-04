import { useMemo, useRef } from "react";
import {
  Bone,
  BoxGeometry,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Skeleton,
  SkinnedMesh,
  Uint16BufferAttribute,
  Vector3,
} from "three";
import { pages } from "./UI";
import { useHelper, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

const PAGE_WIDTH = 1.28;
const PAGE_HEIGHT = 1.71;
const PAGE_DEPTH = 0.003;
const PAGE_SEGMENTS = 30;
const SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS;

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  2
);

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0);

const position = pageGeometry.attributes.position;
const vertex = new Vector3();
const skinIndexes = [];
const skinWeights = [];

for (let i = 0; i < position.count; i++) {
  vertex.fromBufferAttribute(position, i);
  const x = vertex.x;

  const skinIndex = Math.max(0, Math.floor(x / SEGMENT_WIDTH));
  const skinWeight = (x % SEGMENT_WIDTH) / SEGMENT_WIDTH;

  skinIndexes.push(skinIndex, skinIndex + 1, 0, 0);
  skinWeights.push(1 - skinWeight, skinWeight, 0, 0);
}

pageGeometry.setAttribute(
  "skinIndex",
  new Uint16BufferAttribute(skinIndexes, 4)
);

pageGeometry.setAttribute(
  "skinWeight",
  new Float32BufferAttribute(skinWeights, 4)
);

const pageMaterials = [
  new MeshStandardMaterial({
    color: "white",
  }),
  new MeshStandardMaterial({
    color: "#111",
  }),
  new MeshStandardMaterial({
    color: "white",
  }),
  new MeshStandardMaterial({
    color: "white",
  }),
];

const Page = ({ number, front, back, ...props }) => {
  const [picture, pictureRoughness, picture2] = useTexture([
    `/textures/${front}.jpg`,
    `/textures/${back}.jpg`,
    ...(number === 0 || number === pages.length
      ? [`/textures/book-cover-roughness.jpg`]
      : []),
  ]);
  const group = useRef();

  const skinnedMeshRef = useRef();

  const manualSkinnedMesh = useMemo(() => {
    const bones = [];
    for (let i = 0; i <= PAGE_SEGMENTS; i++) {
      const bone = new Bone();
      bones.push(bone);
      if (i === 0) {
        bone.position.x = 0;
      } else {
        bone.position.x = SEGMENT_WIDTH;
        bones[i - 1].add(bone);
      }
    }
    const skeleton = new Skeleton(bones);
    const materials = [
      ...pageMaterials,
      new MeshStandardMaterial({
        color: "white",
        map: picture,
        ...(number === 0
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
      new MeshStandardMaterial({
        color: "white",
        map: picture2,
        ...(number === pages.length - 1
          ? {
              roughnessMap: pictureRoughness,
            }
          : {
              roughness: 0.1,
            }),
      }),
    ];
    const mesh = new SkinnedMesh(pageGeometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    mesh.add(skeleton.bones[0]);
    mesh.bind(skeleton);
    return mesh;
  }, [number, picture, picture2, pictureRoughness]);

  //   useHelper(skinnedMeshRef, SkeletonHelper, "cyan");

  useFrame(() => {
    if (!skinnedMeshRef.current) {
      return;
    }
    const bones = skinnedMeshRef.current.skeleton.bones;
  });

  return (
    <group {...props}>
      <primitive object={manualSkinnedMesh} ref={skinnedMeshRef} />
    </group>
  );
};

export const Book = ({ ...props }) => {
  return (
    <group {...props}>
      {[...pages].map((pageData, index) =>
        index === 0 ? (
          <Page
            position={[0, 0, index * 0.42]}
            key={index}
            number={index}
            {...pageData}
          />
        ) : null
      )}
    </group>
  );
};
