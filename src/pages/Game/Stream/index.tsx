import { Sprite, Stage, Container } from "react-pixi-fiber";
import { Texture } from 'pixi.js'
import { useEffect, createRef } from 'react';
import gsap from "gsap";
// const bunny: string = 'https://i.imgur.com/IaUrttj.png'
// const Bunny = (props: any) => <Sprite texture={Texture.from(bunny)} {...props} anchor={new Point(0.5, 0.5)} />;
import cards from '@/lib/cards'

export default () => {
  const bunnyRef = createRef<any>();
  const stageRef = createRef<any>();
  const videoRef = createRef<any>();
  const width: number = document.documentElement.scrollWidth * .675
  const height: number = document.documentElement.scrollHeight
  const cols: number = 16
  const ratio: number = 5/3
  const _width: number = (width - cols * 2 + 2) / cols
  const _height: number = _width * ratio
  // let recordedChunks = useRef<any>([]);

  function recordEvent () {

    const stream = stageRef.current._canvas.current.captureStream(3); // Capture canvas as a media stream
    
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    // const mediaRecorder = new MediaRecorder(stream, {
    //   mimeType: 'video/webm',
    // });


    // const url = URL.createObjectURL(stream);
        // videoPlayer.src = url;
        // videoPlayer.play();


    // mediaRecorder.ondataavailable = event => {
    //   if (event.data.size > 0) {
    //     recordedChunks.current.push(event.data);
    //   }
    // };

    // // When recording is stopped, create the video and play it
    // mediaRecorder.onstop = () => {
    //   const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
    //   const url = URL.createObjectURL(blob);
    //   console.log(url)
    //   videoRef.current.src = url;
    //   videoRef.current.play();
    // };
    // videoRef.current.src = url
    // videoRef.current.play()
    // mediaRecorder = new MediaRecorder(stream);

    // // // When data is available, add it to the recordedChunks array
    // mediaRecorder.ondataavailable = event => {
    //   if (event.data.size > 0) {
    //     recordedChunks.push(event.data);
    //   }
    // };

    // // Start recording
    // mediaRecorder.start();
    // console.log('Recording started');
    // mediaRecorder.start();
  }

  function cardsAnimation (open: boolean = true) {
    const anims = bunnyRef.current.children.map((sprite: any, index: number, sprites: any) => {
      const baseHeight = Math.floor(index / cols)

      const options = open
        ? {
          x: (_width + 2) * (index % cols) + (_width * .5),
          y: baseHeight * (_height + 2) + _height * .5,
          width: 1,
          height: _height,
          delay: Math.random() * 2,
        }
        : {
          x: centerX,
          y: centerY,
          width: 0,
          height: 0,
          delay: 0
        }



      const ani = gsap.to(sprite, {
          ...options,
          duration: 1, // 持續時間 2 秒
          
          // repeat: 1, // 無限重複
          onComplete () {
            // ani.reverse()
            ani.kill()

            if (open) {
              const _ani2 = gsap.to(sprite, {
                width: _width,
                duration: 0.5,
                onComplete() {
                  _ani2.kill()
                  if (sprites.length -1 === index) {
                    setTimeout(() => { cardsAnimation(false) }, 2000)
                  }
                }
              })
            } else {
              if (sprites.length-1 === index) {
                setTimeout(() => { cardsAnimation(true) }, 2000)
              }
            }

            
          }
        });
      return ani
    })

    return { anims, bunny: bunnyRef.current }
  }


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

    
    const { anims } = cardsAnimation()
    

    return () => {
        // animations.forEach((ani: any) => ani.kill())
        // bunnyRotation.forEach((ani: any) => ani.kill())
        // bunnyRotation.kill();
        anims.forEach((ani: any) => ani.kill())


      } // 組件 unmount 時停止動畫
    }, []);
    
    const centerX = width * .5
    const centerY = height * .5
    // const radius = 150; 
    // const cardSpacing = 360 / cards.length;
    const newHeight = ((Math.floor(cards.length / 16) ) * ((width - 16 * 2 + 2) / 16 * 5/3))
    return <div className=" text-blue-600 flex items-start">



    <Stage ref={stageRef} options={{height: Math.max(height, newHeight), width, background: '#eee' }}>
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
    
    <div>
      <div className="bg-blue-800 text-white rounded py-1 px-3 cursor-pointer" onClick={recordEvent}>START</div>

      <video ref={videoRef} />
    </div>

  </div>
}