import { useEffect } from "react";

const noteFrequencies = {
  "c4": 261.63,
  "d4": 293.66,
  "e4": 329.63,
  "f4": 349.23,
  "g4": 392.00,
  "a4": 440.00,
  "b4": 493.88,
  // ... 添加更多音符
};

export default () => {
  const audioContext = new AudioContext();
  async function loadMusicBoxSound() {
    const response = await fetch('/music/26.ogg');
    const arrayBuffer = await response.arrayBuffer();
    console.log(arrayBuffer)
    return await audioContext.decodeAudioData(arrayBuffer);
  }

  async function playMusicBox(music) {
  
    const audioBuffer = await loadMusicBoxSound('https://onlinesequencer.net/app/instruments/26.ogg');
    
    const notes = music.split(" ");
    let currentTime = audioContext.currentTime;
    const noteDuration = 0.5; // 每个音符的持续时间
  
    for (const note of notes) {
      if (noteFrequencies.hasOwnProperty(note)) {
        playNote(note, currentTime, noteDuration, audioBuffer);
        currentTime += noteDuration;
      }
    }
  }

  function playNote(note: any, startTime: any, duration: any, audioBuffer: any) {
    const oscillator = audioContext.createBufferSource();
    oscillator.buffer = audioBuffer;
    oscillator.connect(audioContext.destination);
    oscillator.playbackRate.value = (noteFrequencies[note]) / noteFrequencies["c4"];
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }
  
  

  useEffect(() => {

    playMusicBox("c4 d4 e4 f4 g4 a4 b4 c4 d4 e4 f4 g4 a4 b4");

  }, [])


  return <>
  MUSIC
  </>
}