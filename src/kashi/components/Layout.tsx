import { Link, NavLink, useLocation } from 'react-router-dom'

import { ReactComponent as BentoBoxLogo } from 'assets/kashi/bento-symbol.svg'
import KashiLogo from 'assets/kashi/logo.png'
import React from 'react'
import { Zero } from '@ethersproject/constants'
import { formattedNum } from 'utils'
import { getCurrency } from 'kashi'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useBentoBalances } from 'state/bentobox/hooks'

interface LayoutProps {
    left?: JSX.Element
    children?: React.ReactChild | React.ReactChild[]
    right?: JSX.Element
    netWorth?: string
}

export default function Layout({
    left = undefined,
    children = undefined,
    right = undefined
}: LayoutProps): JSX.Element {
    const location = useLocation()
    const balances = useBentoBalances()
    const { chainId } = useActiveWeb3React()
    return (
        <div className="container mx-auto px-0 sm:px-4">
            <div className={`mb-2 grid grid-cols-12 gap-4`}>
                <div className="flex justify-center col-span-12 xl:col-span-3 lg:justify-start">
                    <Link to="/bento/kashi/borrow" className="flex justify-center xl:justify-start xl:mx-8">
                        <img src={KashiLogo} alt="" className="object-scale-down h-16 w-1/2 md:w-1/3 xl:w-full" />
                    </Link>
                </div>
                <div className="flex col-span-12 xl:col-span-9 items-end">
                    <nav className="flex justify-between items-center w-full">
                        <div className="flex">
                            <NavLink to="/bento/kashi/lend" className="pl-4 pr-2 sm:pl-8 sm:pr-4 ">
                                <div
                                    className={
                                        'flex items-center  ' +
                                        (location.pathname.startsWith('/bento/kashi/lend') ? '' : ' ')
                                    }
                                >
                                    <div className="whitespace-nowrap ">Lend</div>
                                </div>
                            </NavLink>
                            <NavLink to="/bento/kashi/borrow" className="px-2 sm:px-4 ">
                                <div
                                    className={
                                        'flex items-center  ' +
                                        (location.pathname.startsWith('/bento/kashi/borrow') ? '' : ' ')
                                    }
                                >
                                    <div className="whitespace-nowrap ">Borrow</div>
                                </div>
                            </NavLink>

                            <NavLink to="/bento/kashi/create" className="px-2 sm:px-4 ">
                                <div
                                    className={
                                        'flex items-center  ' +
                                        (location.pathname.startsWith('/bento/kashi/create') ? '' : ' ')
                                    }
                                >
                                    <div className="whitespace-nowrap ">Create</div>
                                </div>
                            </NavLink>
                        </div>
                        <div className="flex pr-2 sm:pr-4">
                            <NavLink
                                to="/bento/balances"
                                className={`px-2 sm:px-4 flex justify-end items-center  ${
                                    location.pathname === '/bento/balances' ? '' : ' '
                                }`}
                            >
                                <BentoBoxLogo className="fill-current h-auto w-6 mr-2" />
                                <div className="whitespace-nowrap ">BentoBox</div>
                                <div className="whitespace-nowrap  ml-2">
                                    {formattedNum(
                                        balances
                                            ?.reduce((previousValue, currentValue) => {
                                                return previousValue.add(currentValue.bento.usdValue)
                                            }, Zero)
                                            .toFixed(getCurrency(chainId).decimals),
                                        true
                                    )}
                                </div>
                            </NavLink>
                        </div>
                    </nav>
                </div>
            </div>
            <div className={`grid grid-cols-12 gap-4 min-h-1/2`}>
                {left && (
                    <div className={`hidden xl:block xl:col-span-3`} style={{ maxHeight: '40rem' }}>
                        {left}
                    </div>
                )}
                <div
                    className={`col-span-12 ${right ? 'lg:col-span-8 xl:col-span-6' : 'xl:col-span-9'}`}
                    style={{ minHeight: '40rem' }}
                >
                    {children}
                </div>
                {right && (
                    <div className="col-span-12 lg:col-span-4 xl:col-span-3" style={{ maxHeight: '40rem' }}>
                        {right}
                    </div>
                )}
            </div>
        </div>
    )
}
