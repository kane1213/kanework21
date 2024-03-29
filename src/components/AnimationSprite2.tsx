import { Texture, AnimatedSprite } from "pixi.js";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Container } from "react-pixi-fiber";


export default forwardRef((props: { texture: any[], speed?: number, x: number, y: number, width: number, height: number, getPlay: any, onpointerdown?: Function }, ref) => {
  const spriteRef = useRef<any>()
  const sprites = new AnimatedSprite(
    props.texture.map((graphic: any) => Texture.from(graphic)))
    useEffect(() => {
      
        sprites.animationSpeed = props.speed || 1;
        sprites.width = props.width
        sprites.height = props.height
        // sprites.loop = true
        sprites.onLoop = () => {
          sprites.gotoAndStop(0)
        }
        
        spriteRef.current.addChild(sprites)

        props.getPlay(() => {
          
          sprites.play()
        })
    }, [])

    useImperativeHandle(ref, () => ({
      play: () => {sprites.play()},
    }));

  return <Container interactive={true} onclick={() => { 
    props.onpointerdown && props.onpointerdown()
  }} ref={spriteRef} x={props.x || 0} y={props.y || 0} width={props.width || 0} height={props.height || 0} />
})