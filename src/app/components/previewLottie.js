"use client"
// components/LottiePlayer.js
import React, { useState } from 'react'
import { useLottie } from 'lottie-react'

const MyLottiePlayer = () => {
  const [animationData, setAnimationData] = useState(null)
  const [bgColor, setBgColor] = useState('#ffffff')
  const [error, setError] = useState('')

  const onFileChange = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const json = await file.text()
        const data = JSON.parse(json)
        setAnimationData(data)
        setError('')
      } catch {
        setError('Invalid JSON file. Please select a valid Lottie animation JSON file.')
      }
    }
  }

  const options = {
    animationData: animationData,
    loop: true,
    autoplay: true,
  }

  const style = {
    width: '100%',
    height: '100%',
    backgroundColor: bgColor,
  }

  const { View } = useLottie(options, style)

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full max-w-xs">
        <input
          type="file"
          accept=".json"
          onChange={onFileChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none"
        />
      </div>
      <div className="mb-4 flex items-center">
        <label className="mr-2 text-sm font-medium text-gray-700">
          Background Color:
        </label>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-10 h-10 p-0 border-0 cursor-pointer"
        />
      </div>
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      {animationData && (
        <div className="bg-white w-2/5 shadow-lg rounded-lg p-4">
          <div className="w-80 h-80">{View}</div>
        </div>
      )}
    </div>
  )
}

export default MyLottiePlayer
