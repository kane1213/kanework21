
import './App.scss'
import { Sprite, Stage  } from "react-pixi-fiber";
import { Texture, Point }from 'pixi.js'
import bunny from "/images/bunny.png";
import { useEffect, useState } from 'react';

// const bunny: string = 'https://i.imgur.com/IaUrttj.png'
const Bunny = (props: any) => <Sprite texture={Texture.from(bunny)} {...props} anchor={new Point(0.5, 0.5)} />;
export default () => {
  const [rotate, setRotate] = useState<number>(0)
  useEffect(() => {
    setInterval(() => {
      setRotate((prev: number) => prev + .05)
    }, 50)
  }, [])

  return <div className=" text-blue-600">
  HELLO WORLD 2
  <Stage options={{height: 600, width: 600, backgroundColor: '#eee' }}>
    <Bunny x={290} y={290} rotation={rotate} /> 
  </Stage>

</div>
}
