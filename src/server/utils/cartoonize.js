import { JSDOM } from 'jsdom'
import { Canvas, createCanvas, Image, ImageData } from 'canvas'

const initialize = () => {
  if (typeof global.document === 'undefined') {
    const { window } = new JSDOM()
    global.document = window.document
    global.Image = Image
    global.HTMLCanvasElement = Canvas
    global.ImageData = ImageData
    global.HTMLImageElement = Image
  }

  const cv = require('opencv4js')
  return cv
}

export const cartoonize = base64File => {
  const cv = initialize()

  const image = new Image()
  image.src = base64File

  const fileMat = cv.imread(image)

  const grayMat = new cv.Mat()
  cv.cvtColor(fileMat, grayMat, cv.COLOR_BGR2GRAY)

  const blurMat = new cv.Mat()
  cv.medianBlur(grayMat, blurMat, 5)

  const edgesMat = new cv.Mat()
  cv.adaptiveThreshold(blurMat, edgesMat, 255, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 9, 9)

  const beforeFilterMat = new cv.Mat()
  cv.cvtColor(fileMat, beforeFilterMat, cv.COLOR_RGBA2RGB, 0)

  const colorMat = new cv.Mat()
  cv.bilateralFilter(beforeFilterMat, colorMat, 9, 250, 250)

  const cartoonMat = new cv.Mat()
  cv.bitwise_and(colorMat, colorMat, cartoonMat, edgesMat)

  const resultCanvas = createCanvas(image.width, image.height)
  cv.imshow(resultCanvas, cartoonMat)

  fileMat.delete()
  grayMat.delete()
  blurMat.delete()
  edgesMat.delete()
  beforeFilterMat.delete()
  colorMat.delete()
  cartoonMat.delete()

  return resultCanvas.toDataURL()
}
