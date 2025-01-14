import React, { memo, useCallback, useEffect, useState } from 'react'
import { WithdrawStyled } from 'components/Withdraw/styled'
import Modal from 'components/Modal'
import { ReactComponent as CrossSVG } from 'assets/images/x.svg'
import Title from 'components/gd/Title'
import { ButtonAction } from 'components/gd/Button'
import { ReactComponent as LinkSVG } from 'assets/images/link-blue.svg'

import PercentInputControls from 'components/Withdraw/PercentInputControls'
import Button from 'components/Button'
import { MyStake, withdraw } from '../../sdk/staking'
import useWeb3 from '../../hooks/useWeb3'
import { addTransaction } from '../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import useActiveWeb3React from '../../hooks/useActiveWeb3React'
import { TransactionDetails } from '../../sdk/constants/transactions'
import { getExplorerLink } from '../../utils'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

function formatNumber(value: number) {
    return Intl.NumberFormat('en-US', { style: 'decimal', maximumFractionDigits: 4 }).format(value)
}

interface WithdrawProps {
    token: string
    protocol: string
    totalStake: number
    open: boolean
    setOpen: (value: boolean) => void
    onWithdraw: () => void
    stake: MyStake
}

type WithdrawState = 'none' | 'pending' | 'success'

function Withdraw({ token, protocol, totalStake, open, setOpen, onWithdraw, stake, ...rest }: WithdrawProps) {
    const { i18n } = useLingui()
    const [status, setStatus] = useState<WithdrawState>('none')

    const [percentage, setPercentage] = useState<string>('50')
    const [withdrawAmount, setWithdrawAmount] = useState<number>(totalStake * (Number(percentage) / 100))

    useEffect(() => {
        setWithdrawAmount(totalStake * (Number(percentage) / 100))
    }, [percentage])
    const dispatch = useDispatch()
    const [transactionHash, setTransactionHash] = useState<string>()
    const { chainId } = useActiveWeb3React()
    const web3 = useWeb3()
    const handleWithdraw = useCallback(async () => {
        if (!web3) return
        try {
            setStatus('pending')
            const transactionDetails = await withdraw(web3, stake.address, parseFloat(percentage), transactionHash => {
                setTransactionHash(transactionHash)
                setStatus('success')
            })
            dispatch(
                addTransaction({
                    chainId: chainId!,
                    hash: transactionDetails.transactionHash,
                    from: transactionDetails.from
                })
            )
            onWithdraw()
        } catch (e) {
            console.error(e)
            setStatus('none')
        }
    }, [setStatus, onWithdraw, percentage])

    const handleClose = useCallback(() => {
        setOpen(false)
    }, [])

    useEffect(() => {
        if (open) setPercentage('50')
        if (open && status !== 'none') {
            setStatus('none')
            setTransactionHash(undefined)
        }
    }, [open])

    return (
        <Modal isOpen={open} noPadding onDismiss={handleClose}>
            <WithdrawStyled {...rest}>
                <div className="flex flex-grow justify-end">
                    <CrossSVG className="cursor-pointer" onClick={handleClose} />
                </div>
                {status === 'none' || status === 'pending' ? (
                    <>
                        <Title className="flex flex-grow justify-center pt-3 pb-3">{i18n._(t`Withdraw`)}</Title>
                        <div className="details-row flex justify-between">
                            <div>{i18n._(t`Token`)}</div>
                            <div>{token}</div>
                        </div>
                        <div className="details-row flex justify-between">
                            <div>{i18n._(t`Protocol`)}</div>
                            <div>{protocol}</div>
                        </div>
                        <div className="details-row flex justify-between">
                            <div>{i18n._(t`Total stake`)}</div>
                            <div>{`${formatNumber(totalStake)} ${token}`}</div>
                        </div>

                        <div className="horizontal mt-4 mb-2" />

                        <PercentInputControls
                            value={percentage}
                            onPercentChange={setPercentage}
                            disabled={status === 'pending'}
                        />

                        <div className="flex flex-col items-center gap-1 relative mt-7">
                            <ButtonAction className="withdraw" disabled={status === 'pending'} onClick={handleWithdraw}>
                                {status === 'pending'
                                    ? i18n._(t`PENDING SIGN...`)
                                    : `${i18n._(t`WITHDRAW`)} ${formatNumber(withdrawAmount)} ${token.toUpperCase()}`}
                            </ButtonAction>
                            {status === 'pending' && (
                                <p className="pending-hint">You need to sign the transaction in your wallet</p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Title className="flex flex-grow justify-center pt-3">{i18n._(t`Success!`)}</Title>
                        <div className="flex justify-center items-center gap-2 pt-7 pb-7">
                            {i18n._(t`Transaction was sent to the blockchain`)}{' '}
                            <a
                                href={
                                    transactionHash &&
                                    chainId &&
                                    getExplorerLink(chainId, transactionHash, 'transaction')
                                }
                                target="_blank"
                                rel="noreferrer"
                            >
                                <LinkSVG className="cursor-pointer" />
                            </a>
                        </div>
                        <div className="flex justify-center">
                            <Button className="back-to-portfolio" onClick={handleClose}>
                                {i18n._(t`Back to portfolio`)}
                            </Button>
                        </div>
                    </>
                )}
            </WithdrawStyled>
        </Modal>
    )
}

export default memo(Withdraw)
