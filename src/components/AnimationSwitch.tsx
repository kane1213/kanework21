import { Texture, AnimatedSprite } from "pixi.js";
import { useEffect, useRef } from "react";
import { Container } from "react-pixi-fiber";

function getImageWidths(urls: string[], callback: (widths: number[]) => void): void {
  const imageWidths: number[] = [];

  function loadImage(url: string, index: number): void {
    const img = new Image();

    img.onload = function () {
      imageWidths[index] = img.width;

      // 檢查是否所有圖片都加載完成
      if (imageWidths.filter(Boolean).length === urls.length) {
        callback(imageWidths);
      }
    };

    img.onerror = function () {
      console.error(`無法加載圖片: ${url}`);
      imageWidths[index] = 0; // 設置為0表示加載失敗

      // 檢查是否所有圖片都加載完成
      if (imageWidths.filter(Boolean).length === urls.length) {
        callback(imageWidths);
      }
    };

    img.src = url;
  }

  // 遍歷所有圖片URL並加載圖片
  urls.forEach((url, index) => {
    loadImage(url, index);
  });
}


export default (props: { texture: any[], speed?: number, x: number, y: number, width?: number, height?: number }) => {
  const spriteRef = useRef<any>()
  const sprites = new AnimatedSprite(
    props.texture.map((graphic: any) => Texture.from(graphic)))

  const currentIdx = useRef<number>(0)
  const scaleObj = useRef<{ [idx: number]: number }>({})
  useEffect(() => {
      sprites.onLoop = () => {
        sprites.gotoAndStop(0)
      }
      
      spriteRef.current.addChild(sprites)
      
      if (props.texture.length === 1 || !props.width) return

      getImageWidths(props.texture, (widths: number[]) => {

        if (widths.length !== props.texture.length) return

        widths.forEach((width:  number, idx: number) => {

          if (!scaleObj.current[idx]) {
            scaleObj.current[idx] = props.width / width
          }
        });



        setInterval(() => {
          currentIdx.current = currentIdx.current === (props.texture.length - 1) 
            ? 0 
            : (currentIdx.current + 1)
          
          
          sprites.gotoAndStop(currentIdx.current)

          setTimeout(() => {
            const scale = scaleObj.current[currentIdx.current]
            console.log(scale)
            if (!!scale) sprites.scale.set(scale, scale)
  
  
          }, 0)
        }, 5000)


      });


      
  }, [])

  return <Container ref={spriteRef} x={props.x || 0} y={props.y || 0} width={props.width || 0} height={props.height || 0} />
}