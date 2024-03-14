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

  color: var(--text-color);

  cursor: pointer;
  transition: background-color 0.1s linear;

  ${props => props.color === 'default'
    ? {
      backgroundColor: 'var(--background-dark-color)',
      color: 'var(--text-color)',
      '&:active': {
        backgroundColor: 'var(--background-dark-active-color)'
      }
    }
    : props.color === 'info'
      ? {
        backgroundColor: 'var(--info-color)',
        '&:active': {
          backgroundColor: 'var(--info-active-color)'
        }
      }
      : props.color === 'danger'
        ? {
          backgroundColor: 'var(--danger-color)',
          '&:active': {
            backgroundColor: 'var(--danger-active-color)'
          }
        }
        : {
          backgroundColor: 'var(--primary-brand-color)',
          color: 'var(--text-foreground-color)',
          '&:active': {
            backgroundColor: 'var(--primary-brand-active-color)'
          }
        }}

  ${props => props.disabled
    ? {
      backgroundColor: 'var(--background-disabled-color)',
      color: 'var(--text-disabled-color)',
      cursor: 'auto',
      '&:active': {
        backgroundColor: 'var(--background-disabled-color)',
        color: 'var(--text-disabled-color)'
      }
    }
    : {}}
`
