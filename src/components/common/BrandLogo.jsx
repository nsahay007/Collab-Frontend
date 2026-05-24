import React from 'react'
import logo from '../../assets/logo.png'
import logo2x from '../../assets/logo@2x.png'

const SIZE_CLASS = {
  nav: 'collab-brand-logo--nav',
  sm: 'collab-brand-logo--sm',
  md: 'collab-brand-logo--md',
}

export default function BrandLogo({ size = 'nav', className = '', ...props }) {
  return (
    <img
      src={logo}
      srcSet={`${logo} 1x, ${logo2x} 2x`}
      alt="Collab"
      className={`collab-brand-logo ${SIZE_CLASS[size] || SIZE_CLASS.nav} ${className}`}
      decoding="async"
      draggable={false}
      {...props}
    />
  )
}
