import { css } from 'styled-components'
import type { valueOf } from 'sockbase'

const ColorType = {
  Default: 'default',
  Info: 'info',
  Danger: 'danger'
} as const
export type ColorTypes = valueOf<typeof ColorType>

export const buttonStyle = css<{ color?: ColorTypes, disabled?: boolean }>`
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: none;
  font-size: 1rem;
  font-weight: bold;

  color: #ffffff;

  cursor: pointer;
  transition: background-color 0.1s linear;

  ${props => props.color === 'default'
    ? {
      backgroundColor: '#e0e0e0',
      color: '#000000',
      '&:active': {
        backgroundColor: '#b3b3b3'
      }
    }
    : props.color === 'info'
      ? {
        backgroundColor: '#20a0f0',
        '&:active': {
          backgroundColor: '#1080e0'
        }
      }
      : props.color === 'danger'
        ? {
          backgroundColor: '#bf4040',
          '&:active': {
            backgroundColor: '#9f2020'
          }
        }
        : {
          backgroundColor: '#ea6183',
          '&:active': {
            backgroundColor: '#99334c'
          }
        }}

  ${props => props.disabled
    ? {
      backgroundColor: '#c0c0c0',
      color: '#808080',
      cursor: 'auto',
      '&:active': {
        backgroundColor: '#c0c0c0',
        color: '#808080'
      }
    }
    : {}}
`