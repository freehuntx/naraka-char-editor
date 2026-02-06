import jsQR from "jsqr";

export async function readQRCode(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(null);
          return;
        }
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          resolve(code.data);
        } else {
          resolve(null);
        }
      };
      image.onerror = reject;
      image.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function readQRCodeFromCanvas(canvas: HTMLCanvasElement): Promise<string | null> {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  return code ? code.data : null;
}

export async function fetchNarakaData(input: string): Promise<string> {
  if (/^https?:\/\//.test(input)) {
    try {
      const response = await fetch(`https://proxy.corsfix.com?${input}`);
      if (!response.ok) throw new Error("Failed to fetch Naraka data from URL");
      return await response.text();
    } catch (e) {
      console.error("Error fetching Naraka data:", e);
      throw e;
    }
  }
  return input;
}
