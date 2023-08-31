import { useEffect } from "react";
import audioData from '@/lib/box-ogg.js';

const noteFrequencies = {
  "C4": 261.63,
  "D4": 293.66,
  "E4": 329.63,
  "F4": 349.23,
  "G4": 392.00,
  "A4": 440.00,
  "B4": 493.88,
  // ... 添加更多音符
};

const noteIndex: string[] = ['c4'].concat(Object.keys(noteFrequencies))

export default () => {
  const audioContext = new AudioContext();
  async function playMusicBox(notes: string[]) {
  
    // const audioBuffer = await loadMusicBoxSound();
  
    let currentTime = 0;
    const noteDuration = 1; // 每个音符的持续时间
  
    for (const note of notes) {
      if (audioData.hasOwnProperty(note)) {
        playAudio(audioData[note].split(',')[1], currentTime)
        currentTime += noteDuration;
      } else {
        currentTime += noteDuration / .5;
      }
    }
  }

  function playAudio(base64Data: any, time: number) {

    const binaryData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(binaryData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < binaryData.length; i++) {
      view[i] = binaryData.charCodeAt(i);
    }
  
    audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(time);
      source.stop(time + 1);
    });
  }

  
  

  useEffect(() => {
    
    

  }, [])
  
  function playMusicEvent () {
    playMusicBox([
      1,1,5,5,6,6,5,-1,,4,4,3,3,2,2,1,-1,
      5,5,4,4,3,3,2,-1,5,5,4,4,3,3,2,-1,
      1,1,5,5,6,6,5,-1,4,4,3,3,2,2,1
    ].map(num => noteIndex[num]));
  }

  return <>
  MUSIC
  <div onClick={playMusicEvent} className="bg-blue-800 text-white cursor-pointer p-2 rounded">START</div>
  </>
}