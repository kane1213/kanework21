import { useEffect, useRef, useState } from "react"

export default () => {
  const base:number = 25
  const observerRef = useRef<any>()
  const [items, setItems] = useState<number[]>(new Array(base).fill(1).map((v:number, i:number) => v+i))

  function addNewItems () {
    setItems((old) => old.concat(new Array(base).fill(old.length + 1).map((v:number, i:number) => v+i)))

  }

  useEffect(() => {
    const parentElement = document.getElementById('hello');
    const targetElement = parentElement?.lastChild
    if (!targetElement) return

    observerRef.current = new IntersectionObserver(
      (payload) => {
        if (payload[0].isIntersecting) {
          observerRef.current.unobserve(targetElement)
          console.log('觸發事件！滑動到目標區塊的 85%');
          addNewItems()
        }
        // entries.forEach(entry => {
        //   if (entry.isIntersecting) {
        //     // 觸發事件，這裡可以放你想要執行的代碼
        //     console.log('觸發事件！滑動到目標區塊的 85%');
        //   }
        // });
      },
      {
        // root: parentElement,
        // rootMargin: '0px',
        threshold: .85,
        // threshold: 0.5
      }
    )
    observerRef.current.observe(targetElement)

  }, [items])




  return <div id="heparent" className="bg-black h-[97.25vh] overflow-y-auto">
    {/* <div className="bg-red-600 w-96 mx-auto min-h-[200vh]"></div> */}
    <div id="hello" className="w-96 mx-auto bg-blue-900">
      {
        items.map((v:number) => <div key={v} className="text-white text-center py-5 border-b">{v}</div>)
      }

    </div>
  </div>
}