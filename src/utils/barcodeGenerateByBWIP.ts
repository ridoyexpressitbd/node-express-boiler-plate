import bwipjs from 'bwip-js'

// const barcodeGenerateByBWIP = async (text: string): Promise<Buffer> => {
//   return await bwipjs.toBuffer({
//     bcid: 'code128', // বারকোড টাইপ (code128, qrcode, ইত্যাদি)
//     text, // SKU বা যেকোনো টেক্সট
//     scale: 3,
//     height: 10,
//     includetext: true,
//     textxalign: 'center'
//   })
// }

export const barcodeGenerateByBWIP = async (text: string) => {
  const svg = bwipjs.toSVG({
    bcid: 'code128', // Barcode type
    text, // Text to encode
    height: 12, // Bar height, in millimeters
    includetext: true, // Show human-readable text
    textxalign: 'center', // Always good to set this
    textcolor: 'ff0000' // Red text
  })

  return svg
}

export const generateRandomBarcodeId = (): string => {
  const part1 = Math.floor(Math.random() * 900) + 100
  const part2 = Math.floor(Math.random() * 90) + 10
  const part3 = Math.floor(Math.random() * 90) + 10
  const part4 = Math.floor(Math.random() * 900) + 100

  // উদাহরণ ফরম্যাট: 153.04.55.022
  return `${part1}.${part2}.${part3}.${part4}`
}
