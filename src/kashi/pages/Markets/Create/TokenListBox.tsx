import { Listbox, Transition } from '@headlessui/react'

import AsyncTokenIcon from '../../../components/AsyncTokenIcon'
import React from 'react'
import { useActiveWeb3React } from 'hooks/useActiveWeb3React'

export default function ListBox({ label, tokens, selectedToken, setSelectedToken, disabled = false }: any) {
    const { chainId } = useActiveWeb3React()
    return (
        <div className="flex items-center justify-center">
            <div className="w-full">
                <Listbox
                    as="div"
                    className="space-y-1 cursor-pointer"
                    value={selectedToken}
                    onChange={setSelectedToken}
                    disabled={disabled}
                >
                    {({ open }) => (
                        <>
                            <Listbox.Label className="block  leading-5   pb-2">{label}</Listbox.Label>
                            <div className="relative">
                                <span className="inline-block w-full rounded-md ">
                                    <Listbox.Button className="cursor-pointer relative w-full rounded-md p-3 left focus:outline-none transition ease-in-out duration-150  sm:leading-5">
                                        <span className="truncate flex items-center">
                                            <AsyncTokenIcon
                                                address={selectedToken.address}
                                                chainId={chainId}
                                                className="w-10 h-10 rounded-sm mr-4"
                                            />
                                            <span className="lg">{selectedToken.symbol}&nbsp;</span>
                                            <span className="lg ">{selectedToken.name}</span>
                                        </span>
                                        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                                            <svg
                                                className="h-5 w-5 "
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </Listbox.Button>
                                </span>

                                <Transition
                                    show={open}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                    className="z-10 absolute mt-1 w-full rounded-md "
                                >
                                    <Listbox.Options
                                        static
                                        className="max-h-60 rounded-md py-1  leading-6 overflow-auto focus:outline-none  sm:leading-5"
                                    >
                                        {tokens.map((token: any) => (
                                            <Listbox.Option key={token.address} value={token}>
                                                {({ selected, active }) => (
                                                    <div
                                                        className={`${
                                                            active ? 'ark-blue' : ''
                                                        } cursor-pointer relative p-3`}
                                                    >
                                                        <span className="flex truncate items-center">
                                                            <AsyncTokenIcon
                                                                address={token.address}
                                                                chainId={chainId}
                                                                className="w-10 h-10 rounded-sm mr-4"
                                                            />
                                                            <span className="lg">{token.symbol}&nbsp;</span>
                                                            <span className="lg ">{token.name}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </Listbox.Option>
                                        ))}
                                    </Listbox.Options>
                                </Transition>
                            </div>
                        </>
                    )}
                </Listbox>
            </div>
        </div>
    )
}
