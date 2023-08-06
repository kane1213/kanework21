import { useEffect, useState } from 'react';
import { combineLatest, merge, of, timer } from 'rxjs';
import { reduce, map, filter, take } from 'rxjs/operators';

export default () => {
  const [num, setNum] = useState<number| string>(0)
  useEffect(() => {
    const observableA = timer(0, 1000);
    const observableB = timer(500, 2000);
    const observableC = timer(1000, 3000);


    const combinedObservable = combineLatest([observableA, observableB, observableC]);

combinedObservable.subscribe(
    ([valueA, valueB, valueC]: any) => {
      // 處理合併後的最新值
      setNum(`最新值：${valueA} | ${valueB} | ${valueC}`);
    },
    error => console.error(error), // 處理錯誤
    () => console.log('Observable 結束') // 當 Observable 完成時的處理
  );
  }, [])


  return <div className="text-center py-10">{ num }</div>
}