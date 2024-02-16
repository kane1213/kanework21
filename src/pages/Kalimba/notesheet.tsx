import { useImperativeHandle, useState, forwardRef, useMemo } from "react";

export default forwardRef((props: any, ref: any) => {

  const [keys, setKeys] = useState<string[]>([])
  const [kidx, setKIdx] = useState<number>(-1)
  const cols = useMemo(() => {
    return keys.length === 0 ? 10 : keys.length
  }, [keys])


  const noteNumber: {[k: string]: string} = {
    'E6': '3',
    'C6': '1',
    'A5': '6',
    'F5': '4',
    'D5': '2',
    'B4': '7',
    'G4': '5',
    'E4': '3',
    'C4': '1',
    'A3': '6',
    'F3': '4',
    'D3': '2',
    'C3': '1',
    'E3': '3',
    'G3': '5',
    'B3': '7',
    'D4': '2',
    'F4': '4',
    'A4': '6',
    'C5': '1',
    'E5': '3',
    'G5': '5',
    'B5': '7',
    'D6': '2',
}

  useImperativeHandle(ref, () => ({
    callvalue: (values: string[], index: number) => {
      setKeys(values)
      setKIdx(index % 10)
    }

  }));

  return <div key={cols + keys.join('|') + '_' + kidx} className={ "text-gray-400 w-full text-xs text-center py-0.5 flex justify-between" }>
    { keys.map((key: string, index: number) => (<div className={"w-[43px] relative " + (index === kidx ? 'text-white ':'')} key={key + cols}>
        {
          index === kidx && <div className="w-3 h-[2px] rounded-full bg-white absolute left-1/2 -bottom-1 -translate-x-1/2"></div>
        }
        
        { key.split(',').map((k: string) => (<div className={"mb-3 last:mb-0 note-" + k.slice(-1)[0]} key={k}>{noteNumber[k]}</div>)) }


    </div>)) }
  </div>

})