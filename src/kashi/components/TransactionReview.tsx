import { Direction, TransactionReview } from 'kashi/entities'
import React from 'react'

import { ArrowDownRight, ArrowUpRight, ArrowRight } from 'react-feather'

function TransactionReviewView({ transactionReview }: { transactionReview: TransactionReview }) {
    return (
        <>
            {transactionReview && transactionReview.length > 0 && (
                <div className="py-4 mb-4">
                    <div className=" ">Transaction Review</div>
                    {transactionReview.map((line, i) => {
                        return (
                            <div className="flex items-center justify-between" key={i}>
                                <div className="lg ">{line.name}:</div>
                                <div className="lg">
                                    {line.from}
                                    {line.direction === Direction.FLAT ? (
                                        <ArrowRight
                                            size="1rem"
                                            style={{ display: 'inline', marginRight: '6px', marginLeft: '6px' }}
                                        />
                                    ) : line.direction === Direction.UP ? (
                                        <ArrowUpRight
                                            size="1rem"
                                            style={{ display: 'inline', marginRight: '6px', marginLeft: '6px' }}
                                        />
                                    ) : (
                                        <ArrowDownRight
                                            size="1rem"
                                            style={{ display: 'inline', marginRight: '6px', marginLeft: '6px' }}
                                        />
                                    )}
                                    {line.to}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </>
    )
}

export default TransactionReviewView
