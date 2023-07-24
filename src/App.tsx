
import './App.scss'
import { Sprite, Stage  } from "react-pixi-fiber";
import { Texture, Point }from 'pixi.js'
import bunny from "/images/bunny.png";
import { useEffect, useRef, createRef } from 'react';
import gsap from "gsap";

// const bunny: string = 'https://i.imgur.com/IaUrttj.png'
const Bunny = (props: any) => <Sprite texture={Texture.from(bunny)} {...props} anchor={new Point(0.5, 0.5)} />;
export default () => {
  // const [rotate, setRotate] = useState<number>(0)
  const bunnyRef = createRef<any>();

  // useEffect(() => {
  //   setInterval(() => {
  //     setRotate((prev: number) => prev + .05)
  //   }, 50)
  // }, [])
  useEffect(() => {
    const bunnyRotation = gsap.to(bunnyRef.current, {
      rotation: Math.PI * 2 , // 旋轉一周
      duration: 2, // 持續時間 2 秒
      repeat: -1, // 無限重複
      // onUpdate: () => {
      //   // 在動畫更新時更新旋轉值
      //   bunnyRef.current = bunnyRef.current + 1;
      //   console.log(bunnyRef.current % (Math.PI * 2) )
      // },
    });

    console.log(bunnyRef.current)

    return () => {bunnyRotation.kill();} // 組件 unmount 時停止動畫
  }, []);

  return <div className=" text-blue-600">
  HELLO WORLD 2
  <Stage options={{height: 600, width: 600, backgroundColor: '#eee' }}>
    {/* <Bunny x={290} y={290}  ref={bunnyRef} />  */}
    <Sprite  x={290} y={290} texture={Texture.from(bunny)} ref={bunnyRef} anchor={new Point(0.5, 0.5)} />
  </Stage>

</div>
}
