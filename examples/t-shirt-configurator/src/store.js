import { proxy } from 'valtio'

import reactImg from './react.png'
import reactThumbImg from './react_thumb.png'
import threeImg from './three2.png'
import threeThumbImg from './three2_thumb.png'
import pmndrsImg from './pmndrs.png'
import pmndrsThumbImg from './pmndrs_thumb.png'

const state = proxy({
  intro: true,
  colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
  decals: [
    { full: reactImg, thumb: reactThumbImg },
    { full: threeImg, thumb: threeThumbImg },
    { full: pmndrsImg, thumb: pmndrsThumbImg }
  ],
  color: '#EFBD4E',
  decal: threeImg
})

export { state }
