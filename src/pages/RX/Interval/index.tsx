import { useEffect, useState } from 'react';
import { interval } from 'rxjs';
import { take, map, filter } from 'rxjs/operators';

export default () => {
  const [num, setNum] = useState<number>(0)
  useEffect(() => {
    const timerObservable = interval(1000).pipe(
      take(10),
      map(value => value + 1),
      filter(value => value % 2 === 0)
    )

    const subscription = timerObservable.subscribe(
      (value: number) => { setNum(value) },
      error => { console.log(error)},
      () => { 
        console.log('complete')
        subscription.unsubscribe()
      }
    )

  }, [])


  return <div className="text-center py-10">{ num }</div>
}