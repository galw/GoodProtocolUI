import React, { useState } from 'react'
import { formattedNum } from '../../../../utils'
import { DoubleLogo, Paper } from '../../components'
import { MasterChefV1Details } from '../Details'

const KashiLending = ({ farm }: any) => {
    const [expand, setExpand] = useState<boolean>(false)
    return (
        <>
            {farm.type === 'SLP' && (
                <Paper className="ark-800">
                    <div
                        className="grid grid-cols-3 py-4 px-4 cursor-pointer select-none rounded "
                        onClick={() => setExpand(!expand)}
                    >
                        <div className="flex items-center">
                            <div className="mr-4">
                                <DoubleLogo
                                    a0={farm.liquidityPair.token0.id}
                                    a1={farm.liquidityPair.token1.id}
                                    size={26}
                                    margin={true}
                                />
                            </div>
                            <div className="hidden sm:block">
                                {farm && farm.liquidityPair.token0.symbol + '-' + farm.liquidityPair.token1.symbol}
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="right">{formattedNum(farm.depositedUSD, true)} </div>
                                <div className=" right">{formattedNum(farm.depositedLP, false)} SLP</div>
                            </div>
                        </div>
                        <div className="flex justify-end items-center">
                            <div>
                                <div className="right">{formattedNum(farm.pendingSushi)} </div>
                                <div className=" right">SUSHI</div>
                            </div>
                        </div>
                    </div>
                    {expand && (
                        <MasterChefV1Details
                            pid={farm.pid}
                            pairAddress={farm.pairAddress}
                            pairSymbol={farm.symbol}
                            token0Address={farm.liquidityPair.token0.id}
                            token1Address={farm.liquidityPair.token1.id}
                            type={'LP'}
                        />
                    )}
                </Paper>
            )}
        </>
    )
}

export default KashiLending
