
import './App.scss'
import { Sprite, Stage, Container } from "react-pixi-fiber";
import { Texture, Point }from 'pixi.js'
import { useEffect, createRef } from 'react';
import gsap from "gsap";

// const bunny: string = 'https://i.imgur.com/IaUrttj.png'
// const Bunny = (props: any) => <Sprite texture={Texture.from(bunny)} {...props} anchor={new Point(0.5, 0.5)} />;
import cards from '@/lib/cards'

export default () => {
  const bunnyRef = createRef<any>();
  useEffect(() => {
    const bunnyRotation = gsap.to(bunnyRef.current, {
      rotation: Math.PI * 2 , // 旋轉一周
      duration: 2, // 持續時間 2 秒
      repeat: 2, // 無限重複
      // onUpdate: () => {
      //   // 在動畫更新時更新旋轉值
      //   bunnyRef.current = bunnyRef.current + 1;
      //   console.log(bunnyRef.current % (Math.PI * 2) )
      // },
    });

    console.log(cards)

    return () => {bunnyRotation.kill();} // 組件 unmount 時停止動畫
  }, []);
  const width: number = document.documentElement.scrollWidth
  const height: number = document.documentElement.scrollHeight
  const centerX = width * .5
  const centerY = height * .5
  const radius = 150; 
  const cardSpacing = 360 / cards.length;
  return <div className=" text-blue-600">
  <Stage options={{height, width, backgroundColor: '#eee' }}>
    {/* <Bunny x={290} y={290}  ref={bunnyRef} />  */}
    {/* <Sprite  x={290} y={290} texture={Texture.from('/images/bunny.png')} ref={bunnyRef} anchor={new Point(0.5, 0.5)} /> */}
    {/* <Sprite texture={Texture.from('/images/cards/ace-of-cups.jpg')} x={0} y={0} zIndex={1} /> */}
    <Container ref={bunnyRef}  x={centerX} y={centerY} >
      {
        cards.map((card: string, index: number) => {
          const angle = cardSpacing * index;
          // console.log(angle)
          // const x = centerY + radius * Math.cos((angle * Math.PI) / 180);
          // const y = centerY + radius * Math.sin((angle * Math.PI) / 180);
          return <Sprite key={card} width={30} height={50} texture={Texture.from(`/images/cards/${card}.jpg`)} anchor={new Point(0.5, 7)} rotation={angle * Math.PI / 180} zIndex={index} />
        })
      }
    </Container>

  </Stage>

</div>
}
