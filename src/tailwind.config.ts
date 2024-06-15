/**
 * This file returns actual tailwind configuration for use in components etc.
 */

import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config.js'

export const twConfig = resolveConfig(tailwindConfig)
export const twTheme = twConfig.theme
