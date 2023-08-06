import { useEffect, useState } from 'react';
import { of, partition } from 'rxjs';
// import { reduce, map, filter, take } from 'rxjs/operators';

export default () => {
  const [num, setNum] = useState<number| string>(0)
  const [num2, setNum2] = useState<number| string>(0)
  useEffect(() => {
    const objserviable = of(...new Array(1000).fill(1).map((v: number, i:number) => v + i))
    const [eventObserviable, oddObserviable] = partition(objserviable, num => num % 2 === 0)


    eventObserviable.subscribe(
      (value: number) => {
        // 處理合併後的最新值
        setNum(value);
      },
      error => console.error(error), // 處理錯誤
      () => console.log('Observable 結束') // 當 Observable 完成時的處理
    );

    oddObserviable.subscribe(
      (value: number) => {
        // 處理合併後的最新值
        setNum2(value);
      },
      error => console.error(error), // 處理錯誤
      () => console.log('Observable 結束') // 當 Observable 完成時的處理
    );

  }, [])


  return <div className="text-center py-10">
    NUM: { num } <br />
    NUM2: { num2 } <br />
  </div>
}