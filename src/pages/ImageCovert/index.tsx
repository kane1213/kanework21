import { useEffect, useState } from "react"


export default () => {
  const [imgSrc, setImgSrc] = useState<string>('')
  useEffect(() => {

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    }
  }, [])

  function handlePaste (event: any) {
    if (event.type === 'paste') {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items;
      if (items.length === 0 || !items[0].type.includes('image')) return
      

      const blob = items[0].getAsFile();
      if (!blob) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;
        // 在這裡你可以將 base64Data 存儲在你想要的地方，例如 state 中或者發送到伺服器。
        copyToClipboard(base64Data);
        setImgSrc(base64Data)
      };

      reader.readAsDataURL(blob);


    }
  }

  function copyToClipboard(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  return <div>

    { imgSrc && <img src={imgSrc} /> }

  </div>
}