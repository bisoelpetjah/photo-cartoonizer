import React, { useRef, useState } from 'react'

import styles from './style.css'

const Home = () => {
  const inputRef = useRef()

  const [fetchController, setFetchController] = useState(null)
  const [originalImage, setOriginalImage] = useState(null)
  const [resultImage, setResultImage] = useState(null)

  const readInputFileAsBase64 = file => new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })

  const cartoonizeImage = async (base64File, controller) => {
    const res = await fetch('/cartoonize', {
      method: 'POST',
      body: base64File,
      signal: controller.signal,
    })
    if (res.status !== 200) throw new Error()
    return res.text()
  }

  const handleFileChange = async e => {
    e.preventDefault()

    const controller = new AbortController()
    setFetchController(controller)
    setResultImage(null)

    const base64File = await readInputFileAsBase64(e.target.files[0])
    setOriginalImage(base64File)

    try {
      const base64Result = await cartoonizeImage(base64File, controller)
      setResultImage(base64Result)
    } finally {
      setFetchController(null)
    }
  }

  const handleClearFile = e => {
    e.preventDefault()

    if (!inputRef) return

    inputRef.current.value = null
    setOriginalImage(null)
    setResultImage(null)
  }

  const handleCancel = e => {
    e.preventDefault()

    fetchController.abort()
    setFetchController(null)
  }

  return (
    <main>
      <div className={styles.headerContainer}>
        <h2>Photo Cartoonizer</h2>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            disabled={!!fetchController}
            onChange={handleFileChange} />
          {!!originalImage && (
            <a
              href="#"
              disabled={!!fetchController}
              onClick={handleClearFile}>
              Clear
            </a>
          )}
        </div>
      </div>
      <div className={styles.imagesContainer}>
        <div className={styles.imageContainer}>
          <h4>Before</h4>
          {originalImage && (
            <img src={originalImage} />
          )}
        </div>
        <div className={styles.imageContainer}>
          <h4>After</h4>
          {!!fetchController && (
            <>
              <br />
              <i>Cartoonizing...</i>
              <br />
              <a href="#" onClick={handleCancel}>Cancel</a>
            </>
          )}
          {resultImage && (
            <img src={resultImage} />
          )}
        </div>
      </div>
    </main>
  )
}

export default Home
