
import './App.scss'
import { Sprite, Stage, Container } from "react-pixi-fiber";
import { Texture, ObservablePoint } from 'pixi.js'
import { useEffect, createRef } from 'react';
import gsap from "gsap";

// const bunny: string = 'https://i.imgur.com/IaUrttj.png'
// const Bunny = (props: any) => <Sprite texture={Texture.from(bunny)} {...props} anchor={new Point(0.5, 0.5)} />;
import cards from '@/lib/cards'

export default () => {
  const bunnyRef = createRef<any>();
  const width: number = document.documentElement.scrollWidth
  const height: number = document.documentElement.scrollHeight
  useEffect(() => {
    // const bunnyRotation = gsap.to(bunnyRef.current, {
    //   rotation: Math.PI * 2 , // 旋轉一周
    //   duration: 2, // 持續時間 2 秒
    //   repeat: 2, // 無限重複
    //   // onUpdate: () => {
    //   //   // 在動畫更新時更新旋轉值
    //   //   bunnyRef.current = bunnyRef.current + 1;
    //   //   console.log(bunnyRef.current % (Math.PI * 2) )
    //   // },
    // });

    // console.log(cards)
    

    // const bunnyRotation = bunnyRef.current.children.map((sprite: any, index: number, list: any) => {
    //   const ani = gsap.to(sprite.anchor, {
    //       // anchor: { x: 0.5, y: 7 },
    //       y: 7,
    //       duration: 2, // 持續時間 2 秒
    //       // repeat: 1, // 無限重複
    //       onComplete () {
    //         ani.reverse()
    //       }
    //     });
    //   return ani
    // })

    const cols = 16
    const _width = (width - cols * 2 + 2) / cols
    const ratio = 5/3
    const _height = _width * ratio

    bunnyRef.current.children.map((sprite: any, index: number) => {
      const baseHeight = Math.floor(index / cols)
      const ani = gsap.to(sprite, {
          x: (_width + 2) * (index % cols) + (_width * .5),
          y: baseHeight * (_height + 2) + _height * .5,
          width: 1,
          height: _height,
          duration: 1, // 持續時間 2 秒
          delay: Math.random() * 2,
          // repeat: 1, // 無限重複
          onComplete () {
            // ani.reverse()
            ani.kill()
            const _ani2 = gsap.to(sprite, {
              width: _width,
              duration: 0.5,
              onComplete() {
                _ani2.kill()
              }
            })
          }
        });
      return ani
    })

    return () => {
      // animations.forEach((ani: any) => ani.kill())
      // bunnyRotation.forEach((ani: any) => ani.kill())
      // bunnyRotation.kill();
    } // 組件 unmount 時停止動畫
  }, []);
  
  const centerX = width * .5
  const centerY = height * .5
  // const radius = 150; 
  const cardSpacing = 360 / cards.length;


  return <div className=" text-blue-600">
  <Stage options={{height, width, background: '#eee' }}>
    {/* <Bunny x={290} y={290}  ref={bunnyRef} />  */}
    {/* <Sprite  x={290} y={290} texture={Texture.from('/images/bunny.png')} ref={bunnyRef} anchor={new Point(0.5, 0.5)} /> */}
    {/* <Sprite texture={Texture.from('/images/cards/ace-of-cups.jpg')} x={0} y={0} zIndex={1} /> */}
    {/* x={centerX} y={centerY} */}
    <Container ref={bunnyRef}  >

      {
        cards.map((card: string, index: number) => {
          return <Sprite key={card} width={1} height={5} scale={9} x={centerX} y={centerY} texture={Texture.from(`/images/cards/${card}.jpg`)} anchor={{ x: 0.5, y: 0.5 }} zIndex={index} />
          return null
        })
      }

      {/* {
        cards.map((card: string, index: number) => {
          const angle = cardSpacing * index;
          return <Sprite key={card} width={30} height={50} texture={Texture.from(`/images/cards/${card}.jpg`)} anchor={{ x: 0.5, y: 1 }} rotation={angle * Math.PI / 180} zIndex={index} />
        })
      } */}
    </Container>

  </Stage>

</div>
}
