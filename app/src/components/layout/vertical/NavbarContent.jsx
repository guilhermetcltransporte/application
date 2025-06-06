'use client'

import classnames from 'classnames'
import NavToggle from './NavToggle'
import NavSearch from '@components/layout/shared/search'
import UserDropdown from '@components/layout/shared/UserDropdown'
import CompanySwitcherDropdown from '@components/layout/shared/CompanySwitcherDropdown' // Importa aqui

import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const NavbarContent = () => {
  return (
    <div
      className={classnames(
        verticalLayoutClasses.navbarContent,
        'flex items-center justify-between gap-4 is-full'
      )}
    >
      <div className='flex items-center gap-[7px]'>
        <NavToggle />
        <NavSearch />
      </div>

      <div className='flex items-center'>
        <CompanySwitcherDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent