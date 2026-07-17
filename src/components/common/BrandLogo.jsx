import React from 'react'
import logo from '../../assets/Final_logo.png'

const SIZE_CLASS = {
  nav: 'collab-brand-logo--nav',
  sm: 'collab-brand-logo--sm',
  md: 'collab-brand-logo--md',
}

export default function BrandLogo({ size = 'nav', className = '', ...props }) {
  return (
    <img
      src={logo}
      alt="Collab"
      className={`collab-brand-logo ${SIZE_CLASS[size] || SIZE_CLASS.nav} ${className}`}
      decoding="async"
      draggable={false}
      {...props}
    />
  )
}
