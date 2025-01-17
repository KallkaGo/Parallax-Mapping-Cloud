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
      uHeight: new Uniform(0.2),
      uTime: new Uniform(0),
      uHeightTileSpeed: new Uniform(new Vector4(1, 1, 0.05, 0)),
      uHeightAmount: new Uniform(0.95),
      uLightColor: new Uniform(new Color()),
      uLightPos: new Uniform(new Vector3(-180, 100, 50)),
    }),
    []
  );

  useControls("color", {
    color: {
      value: "#fff4d6",
      onChange: (value) => {
        uniforms.uLightColor.value.set(value);
      },
    }
  });

 const {mode}= useControls({
    mode: {
      value:'POM',
      options: ['RPM'],
    }
  })

  console.log('mode',mode);

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
        <planeGeometry args={[100, 100, 1, 1]} />
        <CustomShaderMaterial
          defines={{
            [`MODE_${mode}`]: 1
          }}
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
