import React, { useState } from 'react'
import { formattedNum, formattedPercent } from '../../../../utils'
import { DoubleLogo, Paper } from '../../components'
import { MasterChefV1Details, MasterChefV2Details, MiniChefDetails } from '../Details'
import { useActiveWeb3React } from '../../../../hooks/useActiveWeb3React'
import { ChainId } from '@sushiswap/sdk'
import AsyncTokenIcon from '../../../../kashi/components/AsyncTokenIcon'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const LiquidityPosition = ({ farm }: any) => {
    const { i18n } = useLingui()
    const [expand, setExpand] = useState<boolean>(false)
    const { chainId } = useActiveWeb3React()

    return (
        <>
            {farm.type === 'SLP' && (
                <Paper className="ark-800">
                    {process.env.NODE_ENV === 'development' && (
                        <div className="xs">
                            <div>{farm.liquidityPair.token0.id}</div>
                            <div>{farm.liquidityPair.token1.id}</div>
                        </div>
                    )}
                    <div
                        className="grid grid-cols-3 md:grid-cols-4 px-4 py-2  cursor-pointer select-none rounded rounded-b-none"
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="  ">
                            {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                        </div>
                        <div className="hidden md:block   ml-4  right">
                            {/* TODO: remove hard coding */}
                            {farm && farm.contract === 'masterchefv2' ? 'SUSHI & ALCX' : 'SUSHI'}
                        </div>
                        <div className="   right">{formattedNum(farm.tvl, true)}</div>
                        <div className="   right">
                            {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                        </div>
                    </div>
                    <div
                        className="grid grid-cols-3 md:grid-cols-4 py-4 px-4 cursor-pointer select-none rounded "
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="col-span-1 flex items-center">
                            {chainId === ChainId.MATIC ? (
                                <div className="md:col-span-3 flex flex-col space-y-2">
                                    <div className="mr-4 flex flex-row space-x-2 items-center">
                                        <div>
                                            <AsyncTokenIcon
                                                address={farm.liquidityPair.token0.id}
                                                chainId={chainId}
                                                className="block w-10 h-10 rounded-sm"
                                            />
                                        </div>
                                        <div>
                                            <AsyncTokenIcon
                                                address={farm.liquidityPair.token1.id}
                                                chainId={chainId}
                                                className="block w-10 h-10 rounded-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mr-4">
                                    <DoubleLogo
                                        a0={farm.liquidityPair.token0.id}
                                        a1={farm.liquidityPair.token1.id}
                                        size={40}
                                        margin={true}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="md:col-span-1 hidden md:flex flex-row space-x-2 justify-end items-center ml-4">
                            <div>
                                {/* TODO: remove hard coding */}
                                {farm && farm.contract === 'minichef' && (
                                    <>
                                        <div className=" right  xs">
                                            {formattedNum(farm.sushiRewardPerDay)} SUSHI {i18n._(t`per day`)}
                                        </div>
                                        <div className=" right  xs">
                                            {formattedNum(farm.secondaryRewardPerDay)} WMATIC {i18n._(t`per day`)}
                                        </div>
                                    </>
                                )}
                                {farm && farm.contract === 'masterchefv2' && (
                                    <>
                                        <div className=" right  xs">
                                            {formattedNum(farm.sushiRewardPerDay)} SUSHI {i18n._(t`per day`)}
                                        </div>
                                        <div className=" right  xs">
                                            {formattedNum(farm.secondaryRewardPerDay)} ALCX {i18n._(t`per day`)}
                                        </div>
                                    </>
                                )}
                                {farm && farm.contract === 'masterchefv1' && (
                                    <>
                                        <div className=" right   ">{formattedNum(farm.sushiRewardPerDay)} SUSHI</div>
                                        <div className=" right xs">{i18n._(t`per day`)}</div>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                {/* <div className="text-right">{formattedNum(farm.tvl, true)} </div> */}
                                <div className=" right   ">{formattedNum(farm.slpBalance / 1e18, false)} SLP</div>
                                <div className=" right xs">{i18n._(t`Market Staked`)}</div>
                            </div>
                        </div>
                        <div className="md:col-span-1 flex justify-end items-center">
                            <div>
                                <div className=" right   lg">
                                    {farm.roiPerYear > 100 ? '10000%+' : formattedPercent(farm.roiPerYear * 100)}
                                    {/* {formattedPercent(farm.roiPerMonth * 100)}{' '} */}
                                </div>
                                <div className=" right xs">{i18n._(t`annualized`)}</div>
                                {/* <div className="text-gray-500 text-right text-xs">per month</div> */}
                            </div>
                        </div>
                    </div>

                    {expand && farm.contract === 'masterchefv1' && (
                        <MasterChefV1Details
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'LP'}
                        />
                    )}
                    {expand && farm.contract === 'masterchefv2' && (
                        <MasterChefV2Details
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'SLP'}
                        />
                    )}
                    {expand && farm.contract === 'minichef' && (
                        <MiniChefDetails
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'SLP'}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}

export default LiquidityPosition
