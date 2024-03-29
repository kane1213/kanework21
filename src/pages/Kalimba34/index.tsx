import { useEffect, useState, useMemo, useRef, createRef } from 'react'
import { Sprite, Stage, Container, Text } from 'react-pixi-fiber'
// import { AdjustmentFilter } from '@pixi/filter-adjustment';
import AnimatedSprite from '@/components/AnimationSprite'
import AnimatedSwitch from '@/components/AnimationSwitch'
import audioData from '@/lib/kalimba34.js'
import _ from 'lodash'
import { Midi } from '@tonejs/midi'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import gsap from 'gsap'
gsap.registerPlugin(MotionPathPlugin)
import { Texture } from 'pixi.js'
import { useLocation } from 'react-router-dom'
import Sheet from './notesheet'

import bricksframe from '/public/images/kalimba/bricksframe.png'
import woodConsole from '/public/images/kalimba/console.png'
import stick from '/public/images/kalimba/stick_w.png'
import stickd from '/public/images/kalimba/stick_wd.png'
import middleStick from '/public/images/kalimba/middleStick.png'
import stickDark from '/public/images/kalimba/stick_wb.png'
import stickTop from '/public/images/kalimba/stick_t.png'

import cb from '/public/images/kalimba/blue.png'
import cy from '/public/images/kalimba/yellow.png'
import cr from '/public/images/kalimba/red.png'

import nfb from '/public/images/kalimba/notef_b.png'
import nfr from '/public/images/kalimba/notef_r.png'
import nfg from '/public/images/kalimba/notef_g.png'
import nfn from '/public/images/kalimba/notef_w.png'
import bgimgs from './bgimgs'

import './style.scss'
export default () => {
  let MUSICBOX_TITLE: string = ''
  let MUSICBOX_SUBTITLE: string = ''
  let START_HEIGHT = 0
  let forbidNote: string[] = []
  let REPEAT = false
  let SHOWARROW = false

  if (!!window.location.search) {
    const query = window.location.search
      .replace('?', '')
      .split('&')
      .reduce((sum: any, str: string) => {
        const [key, value] = str.split('=')
        return { ...sum, [key]: value }
      }, {})

    forbidNote = query?.forbid ? decodeURI(query.forbid).split(',') : []

    // console.log(forbidNote)
    MUSICBOX_TITLE = query.title ? decodeURI(query.title) : ''
    MUSICBOX_SUBTITLE = query.subtitle ? decodeURI(query.subtitle) : ''
    if (query?.start) START_HEIGHT = query.start
    if (query?.showArrow) SHOWARROW = true
    if (query?.repeat) REPEAT = true
  }

  const CANVAS_WIDTH: number = 555
  const CANVAS_HEIGHT: number = CANVAS_WIDTH * 1.778
  const NOTE_GAP: number = 200
  const DURATION: number = 0.1 / 9
  const TEXT_WIDTH = 474
  const location = useLocation()
  const [name, chosens] = location.pathname.split('/').slice(-2)
  const [chosen, setChosen] = useState<number[]>(
    chosens.split(',').map((val: string) => parseInt(val)) || []
  )
  const [midiTracks, setTracks] = useState<any>([])
  const [notes, setNotes] = useState<any>([])
  const [musicMidi, setMusicMidi] = useState<string>(name)
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const hideNotes = !!localStorage.getItem('hideNotes')
    ? JSON.parse(localStorage.getItem('hideNotes'))
    : []

  const gaspRef = useRef<any>()
  const stageRef = createRef<any>()
  const mainContainer = createRef<any>()
  const notesRef = useRef<any>()
  const aniContainer = useRef<any>({})
  const maskRef = createRef<any>()
  const switchRef = createRef<any>()
  const finishNotes = useRef<any>([])
  const process = createRef<number>()
  const noteSheetRef = createRef<any>()
  const chunkNotesRef = createRef<any>()

  // const [audios, setAudios] = useState<HTMLAudioElement[]>()

  // const noteTimes = useMemo(() => notes.length > 0 ? _.uniq(_.map(notes, 'time')) : [], [notes])
  const defaultKeys = [
    'C',
    'Cb',
    'C#',
    'D',
    'Db',
    'D#',
    'E',
    'F',
    'Fb',
    'F#',
    'G',
    'Gb',
    'G#',
    'A',
    'Ab',
    'A#',
    'B',
  ].filter((k: string) => !k.includes('b'))
  const keyboards = {
    0: ['A', 'B'],
    1: defaultKeys.slice(),
    2: defaultKeys.slice(),
    3: defaultKeys.slice(),
    4: defaultKeys.slice(),
    5: defaultKeys.slice(),
    6: defaultKeys.slice(),
    7: defaultKeys.slice(),
    8: ['C', 'D'],
  }

  const noteNameGroup = useMemo(() => {
    if (notes.length === 0) return {}

    const showNotes = notes.filter(
      (_note: any) =>
        !hideNotes.some(
          (_hideNote: any) =>
            _hideNote.midi === _note.midi && _hideNote.time === _note.time
        )
    )

    const groupNotes = _.groupBy(showNotes, 'name')
    const useNumber: number[] = _.uniq(
      Object.keys(groupNotes).map((key: string) => parseInt(key.slice(-1)[0]))
    )
    const _notes = useNumber.reduce((sum: any, num: number) => {
      keyboards[num].forEach((key: string) => {
        const noteKey = `${key}${num}`
        sum[noteKey] =
          groupNotes.hasOwnProperty(noteKey) &&
          audioData.hasOwnProperty(noteKey) &&
          !forbidNote.includes(noteKey)
            ? _.uniqBy(groupNotes[noteKey], (note: any) =>
                Math.floor(note.time * 7.5)
              )
            : []
        // sum[noteKey] = groupNotes.hasOwnProperty(noteKey)
        //   ? groupNotes[noteKey]
        //   : []
      })
      return sum
    }, {})
    return _notes
  }, [notes])

  const notePosition = [
    ['D6', 'D#6'],
    ['B5', 'C6'],
    ['G5', 'G#5'],
    ['E5', 'F5'],
    ['C5', 'C#5'],
    ['A4', 'A#4'],
    ['F4', 'B3'],
    ['D4', 'G3'],
    ['C4', 'F3'],
    ['E4', 'A3'],
    ['G4', 'G#4'],
    ['B4', ''],
    ['D5', 'D#5'],
    ['F5', 'F#5'],
    ['A5', 'A#5'],
    ['C6', 'C#6'],
    ['E6', 'F6'],
  ].reduce(
    (
      sum: { [k: string]: { x: number; y: number } },
      text: string[],
      index: number
    ) => ({
      ...sum,
      [text[0]]: { x: index, y: 0 },
      [text[1]]: { x: index, y: 1 },
    }),
    {}
  )
  // const notePosition = { 'D6': 0,  B5: 1,  G5: 2,  E5: 3,  C5: 4,  A4: 5,  F4: 6,  D4: 7,  C4: 8,  E4: 9,  G4: 10,  B4: 11,  D5: 12,  F5: 13,  A5: 14,  C6: 15,  E6: 16,}

  const noteNumber: number = 17

  const NOTE_SIZE: number = TEXT_WIDTH / (noteNumber + 3)
  const stickWidth: number = TEXT_WIDTH / (noteNumber + 3)

  function playAudioByNoteText(text: string) {
    if (!text) return
    // console.log({ text })
    playAudio(text, 0, 1.5)
    aniContainer.current[text]()
    aniContainer.current['n' + text]()
  }

  function copyToClipboard(text: string) {
    var textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  function playAudio(text: string) {
    const base64Data = audioData[text]
    var audio = audioContext.createBufferSource()
    const gainNode = audioContext.createGain()
    // (['A1', 'E1', 'B1', 'G1','A2', 'E2', 'B2', 'G2', 'E3', 'A3', 'C3', 'G3'].some((k: string) => k === text))
    // gainNode.gain.value = parseInt(text.slice(-1)[0]) <= 3
    //   ? 0.7
    //   : 1
    try {
      // 解碼音樂 base64 字串
      audioContext.decodeAudioData(
        base64ToArrayBuffer(base64Data),
        function (buffer) {
          // 設置 Audio 元素的音訊緩衝
          audio.buffer = buffer
          // 連接 Audio 元素到音訊輸出
          gainNode.connect(audioContext.destination)
          audio.connect(gainNode)
          // 播放音樂
          audio.start()
        }
      )
      // const audio = new Audio(base64Data)
      // audio.play()
    } catch (error) {
      console.log({ text, error })
    }
  }

  function base64ToArrayBuffer(base64: string) {
    var binary_string = window.atob(base64.split(',')[1])
    var len = binary_string.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
  }

  async function readMidiFile(name: string) {
    // const { tracks } = await Midi.fromUrl(`/public/music/midi/${name}.mid`)
    const _name = name.includes('.mid')
      ? name
      : `/public/music/midi/${name}.mid`
    const { tracks } = await Midi.fromUrl(_name)
    // const _tracks = tracks.filter((track: any) => track.notes.length > 0)

    setTracks(tracks)
  }

  function chunkNoteEvent() {
    const _notes = _.orderBy(
      notesRef.current.children,
      (note: any) => note.y,
      'desc'
    )
    const _groupNotes = _.groupBy(_notes, (note: any) =>
      Math.floor(note.y / 10)
    )
    return _.chunk(Object.values(_groupNotes), 10)
  }

  function musicBoxStart() {
    let curIdx: number = -1

    gaspRef.current = gsap.to(notesRef.current, {
      y: notesRef.current.height * 1.8,
      duration: notesRef.current.height * DURATION,
      ease: 'none',
      // delay: 0.5,
      onStart() {
        finishNotes.current = []
      },
      onUpdate() {
        const currentY = Math.floor(notesRef.current.y)
        const equalZeroSprite = notesRef.current.children
          .filter((child: any) => !finishNotes.current.includes(child))
          .filter((child: any, index: number) => {
            return Math.floor(currentY + child.y) > 390
          })
        if (equalZeroSprite.length > 0) {
          finishNotes.current = finishNotes.current.concat(equalZeroSprite)
          equalZeroSprite.forEach((sprite: any) => {
            {
              playAudioByNoteText(sprite.alt)
            }
          })

          const _sprite = _.get(equalZeroSprite, [0])

          const _chunkNote = chunkNotesRef.current.find((list: any) => {
            return list.flat().some((_s: any, idx: number) => {
              // curIdx = idx
              if (_s === _sprite) {
                return true
              }
              return false
            })
          })
          curIdx += 1
          noteSheetRef.current.callvalue(
            _chunkNote?.map((note: any) => note.map((n) => n.alt).join()),
            curIdx
          )

          showProcess(notesRef.current.height * 1.8, notesRef.current.y)
        }
      },
      onComplete() {
        // alert("DONE")
        notesRef.current.y = 0
        finishNotes.current = []
        if (REPEAT) musicBoxStart()
      },
    })
  }

  function showProcess(height: number, y: number) {
    const _process = Math.floor((Math.abs(y) / Math.abs(height)) * 100) + 2
    if (process.current != _process) {
      process.current = _process
      document.title = process.current + '%'
    }
  }

  function filternotes(_noteList: any) {
    const _list = Object.values(_.groupBy(_noteList, 'name'))

    _.reverse(_list)

    // const keys = Object.keys(_.groupBy(_noteList, 'name'))
    // console.log(keys)
    _list.forEach((notes: any) => {
      _.orderBy(notes, ['time'], ['desc']).forEach(
        (note: any, index: number, list: any) => {
          if (index === 0 || list[index - 1].shouldDelete) return
          // if (note.name === 'C5') {
          //   const prev = list[index - 1]
          //   console.log(prev.time, note.time, prev.time - note.time)
          // }
          const diff = Math.abs(note.time - list[index - 1].time)
          // if (note.name === 'C5') console.log({ diff })
          if (diff < 0.2) {
            note['shouldDelete'] = true
          }
        }
      )
    })

    return _noteList.filter((note: any) => !note.shouldDelete)
  }

  function initMusicEvent() {
    if (chosen.length === 0) return
    const _notes: any = midiTracks
      .filter((_: any, index: number) => chosen.includes(index))
      .flatMap((track: any) => {
        const _newNotes = track.notes.map((note: any) => {
          // const time = Math.floor(note.time) + (note.time % 1 > 0 ? 0.5 : 0)
          // const _name = note.name.replace('#', '')
          // const _num = parseInt(_name.slice(-1)[0]) - 1
          // const name = _name.substring(0, 1) + _num

          const name = note.name

          return { ...note, name, time: note.time }
        })
        return _newNotes
      })

    // notesRef.current.y = -_notes.slice(-1)[0].time * NOTE_GAP
    notesRef.current.y = 360
    notesRef.current.mask = maskRef.current
    // const _noteList = filternotes(_notes)
    const _noteList = _notes

    setNotes(_noteList)
  }

  useEffect(() => {
    chunkNotesRef.current = chunkNoteEvent()
    // console.log(_chunkNotes[0]?.map((note) => note.map((n) => n.alt).join()))
    const noteList = chunkNotesRef.current[0]?.map((note: any) =>
      note.map((n: any) => n.alt).join()
    )
    if (!noteList) return
    noteSheetRef.current.callvalue(noteList, -1)
    // console.log(noteSheetRef.current)
    // noteSheetRef.current.callvalue()
  }, [notes])

  function onWheelEvent(evt: any) {
    const volume: number = 10

    notesRef.current.y += (evt.deltaY > 0 ? 1 : -1) * volume
  }

  function playMusicEvent(event: any) {
    if (!!gaspRef.current) {
      if (gaspRef.current.paused()) {
        if (event.ctrlKey) {
          // notesRef.current.y = (CANVAS_HEIGHT * .5 + 5) - parseInt(START_HEIGHT)
          // finishNotes.current = []
          // notesRef.current.y = notesRef.current.y
          gaspRef.current.restart()
        } else {
          gaspRef.current.resume()
        }
      } else {
        gaspRef.current.pause()
      }
      return
    }

    if (notes.length > 0) {
      musicBoxStart()
    }
  }

  useEffect(() => {
    readMidiFile(musicMidi)

    // wheelRefOne.current.mask = wheelMaskRef.current
    // wheelRefTwo.current.mask = wheelMaskRef.current

    // gsap.to(wheelRefOne.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })
    // gsap.to(wheelRefTwo.current, { y: -40, duration: 1, repeat: -1, ease: "linear" })

    if (mainContainer.current) {
      setTimeout(() => {
        const scale: number = CANVAS_WIDTH / mainContainer.current.width
        // console.log({ scale, current: mainContainer.current })
        // mainContainer.current.scale = scale;

        mainContainer.current.width *= scale
        mainContainer.current.height *= scale

        // mainContainer.current.x = (CANVAS_WIDTH - mainContainer.current.width) * .5
        // mainContainer.current.y = (CANVAS_HEIGHT - mainContainer.current.height) * .5
      }, 0)
    }
  }, [])
  useEffect(() => {
    if (midiTracks.length === 0) return

    initMusicEvent()
  }, [midiTracks])

  const excludes: string[] = [] // "C6", "D6", "E6", "A5", "B5", "F5", "G5",
  // const excludes: string[] = ["A6", "B6", "F6", "G6", 'A3', 'B3', 'F3', 'G3', "C3", "D3", "E3"]
  const notekeys: string[] = Object.keys(audioData).filter(
    (k: string) => !excludes.includes(k)
  )
  const cubes = [cb, cr, cy]
  const notefs = [nfb, nfr, nfg]

  return (
    <div className={SHOWARROW ? '' : 'cursor-none'}>
      <Stage
        onWheel={onWheelEvent}
        className="mt-4 ml-3"
        ref={stageRef}
        options={{
          height: CANVAS_HEIGHT,
          width: CANVAS_WIDTH,
          background: '#fff',
        }}
      >
        <Container ref={mainContainer} x={0} y={0}>
          <Sprite
            texture={Texture.from(woodConsole)}
            interactive={true}
            onpointerdown={playMusicEvent}
          />
          <Sprite texture={Texture.from(bricksframe)} y={10} x={15} />
        </Container>

        <Sprite
          ref={maskRef}
          width={CANVAS_WIDTH - 70}
          height={418}
          texture={Texture.WHITE}
          x={35}
          y={20}
          tint="0x000000"
        />

        {bgimgs.length > 0 && (
          <Container alpha={0.5} ref={switchRef}>
            <AnimatedSwitch x={41} y={20} width={TEXT_WIDTH} texture={bgimgs} />
          </Container>
        )}

        <Sprite
          texture={Texture.from(middleStick)}
          y={482}
          x={25}
          width={510}
          height={25}
        />

        <Container x={42} y={520}>
          {notekeys.map((key: string, index: number) => {
            const x =
              _.get(notePosition[key], 'x', 0) * (TEXT_WIDTH / noteNumber)

            const hgt = _.get(notePosition[key], 'y', 0) * 40
            if (key.includes('3')) {
              console.log({ key, x })
            }
            return (
              <>
                <Sprite
                  width={stickWidth}
                  height={stickWidth * 0.75}
                  texture={Texture.WHITE}
                  x={x}
                  y={-15}
                  tint="0x000000"
                />

                <Sprite
                  width={stickWidth}
                  texture={Texture.from(stickTop)}
                  x={x}
                  y={-70}
                />
                <AnimatedSprite
                  onpointerdown={() => {
                    playAudioByNoteText(key)
                  }}
                  getPlay={(play: any) => {
                    // console.log(key)
                    aniContainer.current = {
                      ...aniContainer.current,
                      [key]: play,
                    }
                  }}
                  speed={0.15}
                  texture={[hgt === 0 ? stickd : stick, stickDark]}
                  key={key}
                  x={x}
                  y={0}
                  width={stickWidth}
                  height={
                    40 +
                    (200 -
                      Math.abs(8 - _.get(notePosition[key], 'x', 0)) * 12) -
                    hgt
                  }
                />
              </>
            )
          })}
        </Container>

        <Container ref={notesRef} x={38}>
          {...Object.entries(noteNameGroup)
            .filter(([_, notes]: any) => notes.length > 0)
            .filter(([key]: any) => notekeys.includes(key))
            .map(([key, notes]: any, notesIndex: number): any => {
              return notes
                .filter((note: any) => note.time < 46)
                .map((note: any, noteIndex: number) => {
                  const adj = 0

                  return (
                    <Sprite
                      alt={key}
                      eventMode="dynamic"
                      onclick={(event: any) => {
                        if (event.ctrlKey) {
                          const { midi, time } = note
                          hideNotes.push({ midi, time })
                          localStorage.setItem(
                            'hideNotes',
                            JSON.stringify(hideNotes)
                          )
                          setNotes((_notes: any) =>
                            _notes.filter((_note: any) => _note !== note)
                          )
                        } else {
                          console.log({ [note.midi]: note.time })
                          playAudioByNoteText(key)
                        }
                      }}
                      texture={Texture.from(
                        cubes[Math.floor(cubes.length * Math.random())]
                      )}
                      key={key + '-' + notesIndex + '-' + noteIndex}
                      width={NOTE_SIZE}
                      height={NOTE_SIZE}
                      x={
                        _.get(notePosition[key], 'x', 0) *
                          (TEXT_WIDTH / Object.keys(notePosition).length) +
                        4
                      }
                      y={(note.time - adj) * -NOTE_GAP}
                      zIndex={noteIndex}
                    >
                      {/* <Text x={1} y={3}  style={{ fill: '#ffffff', fontSize: 8, align: 'center' }} text={key} /> */}
                    </Sprite>
                  )
                })
            })}
        </Container>

        {/* 符號 */}
        <Container x={42} y={421}>
          {notekeys.map((key: string, index: number) => {
            const x =
              _.get(notePosition[key], 'x', 0) * (TEXT_WIDTH / noteNumber)
            const y = _.get(notePosition[key], 'y', 0) * -25
            return (
              <Container x={x} y={y}>
                <AnimatedSprite
                  speed={0.25}
                  width={NOTE_SIZE}
                  height={NOTE_SIZE}
                  // texture={Texture.from(notefs[Math.floor(notefs.length * Math.random())])}

                  texture={[
                    notefs[Math.floor(notefs.length * Math.random())],
                    nfn,
                  ]}
                  getPlay={(play: any) => {
                    // console.log(key)
                    aniContainer.current = {
                      ...aniContainer.current,
                      ['n' + key]: play,
                    }
                  }}
                  tint="0xEEEEEE"
                ></AnimatedSprite>
                <Text
                  x={3}
                  y={3}
                  zIndex={1000}
                  style={{ fill: '#ffffff', fontSize: 11, align: 'center' }}
                  text={key}
                />
              </Container>
            )
          })}
        </Container>
      </Stage>
      <div className=" absolute top-9 left-[55px] w-[471px] h-[400px] bg-gradient-to-b from-black/80 via-black/25 to-transparent pt-5 pb-6 flex flex-col justify-between">
        <div className="text-white text-2xl font-bold shadow-sm  text-center pt-1 pb-10">
          <span dangerouslySetInnerHTML={{ __html: MUSICBOX_TITLE }} />
        </div>
        <div className="bg-gradient-to-b from-blue-800/40 to-blue-900/40 border-2 border-gray-300 w-[453px] py-2  rounded-lg mx-auto">
          <Sheet ref={noteSheetRef} />
        </div>
      </div>
    </div>
  )
}
