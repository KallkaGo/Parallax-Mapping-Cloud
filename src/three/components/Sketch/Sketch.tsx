import { OrbitControls } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useInteractStore, useLoadedStore } from "@utils/Store";
import { useEffect, useMemo, useRef } from "react";
import { TGALoader } from "three-stdlib";
import CustomShaderMaterial from "three-custom-shader-material";
import {
  Color,
  MeshBasicMaterial,
  RepeatWrapping,
  ShaderMaterial,
  Uniform,
  Vector3,
  Vector4,
} from "three";
import vertexShader from "../Shader/vertex.glsl";
import fragmentShader from "../Shader/fragment.glsl";
import { useControls } from "leva";

const Sketch = () => {
  const cloudTex = useLoader(TGALoader, "cloudtex.tga");
  cloudTex.flipY = false;
  cloudTex.wrapS = cloudTex.wrapT = RepeatWrapping;

  const controlDom = useInteractStore((state) => state.controlDom);

  const uniforms = useMemo(
    () => ({
      uCloudTex: new Uniform(cloudTex),
      uHeight: new Uniform(0.15),
      uTime: new Uniform(0),
      uHeightTileSpeed: new Uniform(new Vector4(1, 1, 0.05, 0)),
      uHeightAmount: new Uniform(0.95),
      uLightColor: new Uniform(new Color("rgb(255, 244, 214)")),
      uLightPos: new Uniform(new Vector3(-120, 50, 100)),
    }),
    []
  );

  useControls("color", {
    color: {
      value: "rgb(255, 244, 214)",
      onChange: (value) => {
        uniforms.uLightColor.value.set(value);
      },
    },
  });

  useEffect(() => {
    useLoadedStore.setState({ ready: true });
  }, []);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
  });

  return (
    <>
      <OrbitControls domElement={controlDom} />
      <color attach={"background"} args={["black"]} />
      <mesh rotation-x={-Math.PI / 2}>
        <planeGeometry args={[100, 100]} />
        <CustomShaderMaterial
          baseMaterial={ShaderMaterial}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          silent
        />
      </mesh>
    </>
  );
};

export default Sketch;
