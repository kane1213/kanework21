import { useEffect, useRef, useState } from 'react';
import { Observable } from 'rxjs';

export default () => {
  const [num, setNum] = useState<number| string>(0)
  const myObservable = useRef<any>(new Observable<string>((subscribe) => {
    ['Alice', 'Ben', 'Charlie'].forEach((name: string, index: number) => {

      setTimeout(() => {
        subscribe.next(name)

      }, 2000 * index)

    })
  }))
  useEffect(() => {
    
    const subscrption = myObservable.current.subscribe({ next (value: string) {
      setNum(value)
    }})

    setTimeout(() => {
      subscrption.unsubscribe()
    }, 3000)

  }, [])


  return <div className="text-center py-10">{ num }</div>
}