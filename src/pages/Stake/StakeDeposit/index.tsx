import React, { memo, useEffect, useMemo, useReducer } from 'react'
import { StakeDepositSC } from './styled'
import Title from '../../../components/gd/Title'
import AsyncTokenIcon from '../../../kashi/components/AsyncTokenIcon'
import { Switch } from '../styled'
import SwapInput from '../../Swap/SwapInput'
import { ButtonAction, ButtonDefault, ButtonText } from '../../../components/gd/Button'
import { Stake, approve, stake as deposit, getTokenPriceInUSDC } from '../../../sdk/staking'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { Token } from '@sushiswap/sdk'
import useWeb3 from '../../../hooks/useWeb3'
import { addTransaction } from '../../../state/transactions/actions'
import { useDispatch } from 'react-redux'
import { getExplorerLink } from '../../../utils'
import { ReactComponent as LinkSVG } from '../../../assets/images/link-blue.svg'
import { Link } from 'react-router-dom'
import { TransactionDetails } from '../../../sdk/constants/transactions'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

export interface StakeDepositModalProps {
    stake: Stake
    onDeposit?: () => any
    onClose: () => any
}

export type Action<T extends string, P = never> = [P] extends [never]
    ? { type: T }
    : P extends undefined
    ? { type: T; payload?: P }
    : { type: T; payload: P }

const initialState = {
    token: 'A' as 'A' | 'B', // stake.tokens.A or stake.tokens.B,
    value: '',
    dollarEquivalent: undefined as undefined | string,
    approved: false,
    signed: false,
    loading: false,
    error: undefined as undefined | string,
    done: false,
    transactionHash: undefined as undefined | string
}

const StakeDeposit = ({ stake, onDeposit, onClose }: StakeDepositModalProps) => {
    const { i18n } = useLingui()
    const { chainId, account } = useActiveWeb3React()
    const web3 = useWeb3()

    const [state, dispatch] = useReducer(
        (
            state: typeof initialState,
            action:
                | Action<'TOGGLE_TOKEN', boolean>
                | Action<'TOGGLE_LOADING'>
                | Action<'CHANGE_VALUE', string>
                | Action<'CHANGE_SIGNED'>
                | Action<'CHANGE_APPROVED', string | undefined>
                | Action<'SET_ERROR', Error>
                | Action<'DONE', string>
        ) => {
            switch (action.type) {
                case 'TOGGLE_TOKEN':
                    return {
                        ...state,
                        token: action.payload ? ('B' as const) : ('A' as const)
                    }
                case 'CHANGE_VALUE':
                    return {
                        ...state,
                        value: action.payload
                    }
                case 'CHANGE_SIGNED':
                    return {
                        ...state,
                        signed: true
                    }
                case 'CHANGE_APPROVED':
                    return {
                        ...state,
                        approved: typeof action.payload === 'string',
                        dollarEquivalent: action.payload
                    }
                case 'TOGGLE_LOADING':
                    return {
                        ...state,
                        error: state.loading ? state.error : undefined,
                        loading: !state.loading
                    }
                case 'SET_ERROR':
                    return {
                        ...state,
                        error: action.payload.message
                    }
                case 'DONE':
                    return {
                        ...state,
                        done: true,
                        transactionHash: action.payload
                    }
            }
        },
        initialState
    )
    const tokenToDeposit = stake.tokens[state.token]
    const tokenToDepositBalance = useTokenBalance(
        account,
        useMemo(
            () =>
                chainId &&
                new Token(
                    chainId,
                    tokenToDeposit.address,
                    tokenToDeposit.decimals,
                    tokenToDeposit.symbol,
                    tokenToDeposit.name
                ),
            [tokenToDeposit]
        )
    )

    useEffect(() => {
        if (state.approved)
            dispatch({
                type: 'CHANGE_APPROVED'
            })
    }, [state.value])

    const withLoading = async (cb: Function) => {
        try {
            dispatch({ type: 'TOGGLE_LOADING' })
            await cb()
        } catch (e) {
            dispatch({
                type: 'SET_ERROR',
                payload: e as Error
            })
        } finally {
            dispatch({ type: 'TOGGLE_LOADING' })
        }
    }

    const reduxDispatch = useDispatch()

    const approving = !state.done && !state.approved
    const depositing = !state.done && state.approved

    return (
        <StakeDepositSC className="p-4">
            <Title className="flex space-x-2 items-center justify-center mb-2">
                {approving ? (
                    <>
                        <span>STAKE</span>
                        <AsyncTokenIcon
                            address={stake.tokens.A.address}
                            chainId={chainId}
                            className="block w-5 h-5 rounded-full"
                        />
                        <span>{stake.tokens.A.symbol}</span>
                    </>
                ) : depositing ? (
                    i18n._(t`Deposit overview`)
                ) : (
                    i18n._(t`Success!`)
                )}
            </Title>
            {(approving || state.error) && (
                <div className="error mb-2">
                    {state.error ? (
                        state.error
                    ) : (
                        <>
                            Warning message goes here... <br /> Warning message goes here...
                        </>
                    )}
                </div>
            )}
            {approving ? (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <span>{i18n._(t`How much would you like to deposit?`)}</span>
                        <div className="flex items-center space-x-1">
                            <span>{stake.tokens.A.symbol}</span>
                            <Switch>
                                <div className="area" />
                                <input
                                    type="checkbox"
                                    checked={state.token === 'B'}
                                    disabled={state.loading}
                                    onChange={e =>
                                        dispatch({
                                            type: 'TOGGLE_TOKEN',
                                            payload: e.currentTarget.checked
                                        })
                                    }
                                />
                                <div className="toggle" />
                            </Switch>
                            <span>{stake.tokens.B.symbol}</span>
                        </div>
                    </div>
                    <SwapInput
                        balance={tokenToDepositBalance?.toSignificant(6, { groupSeparator: ',' })}
                        autoMax
                        disabled={state.loading}
                        value={state.value}
                        onMax={() => {
                            dispatch({
                                type: 'CHANGE_VALUE',
                                payload: tokenToDepositBalance?.toExact() ?? '0'
                            })
                        }}
                        onChange={e =>
                            dispatch({
                                type: 'CHANGE_VALUE',
                                payload: e.currentTarget.value
                            })
                        }
                    />
                    <ButtonAction
                        className="mt-4"
                        disabled={!state.value.match(/[^0.]/) || !web3 || !account || state.loading}
                        onClick={() =>
                            withLoading(async () => {
                                const [tokenPriceInUSDC] = await Promise.all([
                                    await getTokenPriceInUSDC(web3!, stake.protocol, tokenToDeposit),
                                    await approve(web3!, stake.address, state.value, state.token === 'B', () => {
                                        dispatch({ type: 'CHANGE_SIGNED' })
                                    })
                                ])
                                dispatch({
                                    type: 'CHANGE_APPROVED',
                                    payload: tokenPriceInUSDC?.toSignificant(6) ?? ''
                                })
                            })
                        }
                    >
                        {state.loading
                            ? i18n._(t`APPROVING`)
                            : !account
                            ? i18n._(t`Connect wallet`)
                            : i18n._(t`APPROVE`)}
                    </ButtonAction>
                </>
            ) : depositing ? (
                <>
                    <div className="flex justify-between items-start">
                        <div className="amount">{i18n._(t`amount`)}</div>
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-2 token">
                                <AsyncTokenIcon
                                    address={stake.tokens.A.address}
                                    chainId={chainId}
                                    className="block w-5 h-5 rounded-full"
                                />
                                <span>{state.value}</span>
                                <span>{tokenToDeposit.symbol}</span>
                            </div>
                            <div className="dollar-equivalent self-end">
                                {state.dollarEquivalent && `$${state.dollarEquivalent}`}
                            </div>
                        </div>
                    </div>
                    <div className="px-2">
                        <ButtonAction
                            className="mt-6"
                            disabled={state.loading}
                            onClick={() =>
                                withLoading(async () => {
                                    const transactionDetails = await deposit(
                                        web3!,
                                        stake.address,
                                        state.value,
                                        state.token === 'B',
                                        transactionHash => {
                                            dispatch({ type: 'DONE', payload: transactionHash })
                                        }
                                    )
                                    reduxDispatch(
                                        addTransaction({
                                            chainId: chainId!,
                                            hash: transactionDetails.transactionHash,
                                            from: transactionDetails.from
                                        })
                                    )
                                    if (onDeposit) onDeposit()
                                })
                            }
                        >
                            {i18n._(t`DEPOSIT`)}
                        </ButtonAction>
                    </div>
                </>
            ) : (
                <>
                    <div className="text-center mt-4">
                        Transaction was sent to the blockchain{' '}
                        <a
                            href={
                                state.transactionHash &&
                                chainId &&
                                getExplorerLink(chainId, state.transactionHash, 'transaction')
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            <LinkSVG className="inline-block cursor-pointer" />
                        </a>
                    </div>
                    <div className="flex flex-col items-center mt-4 space-y-2">
                        <Link to="/portfolio">
                            <ButtonDefault className="uppercase px-6" width="auto">
                                {i18n._(t`Back to portfolio`)}
                            </ButtonDefault>
                        </Link>
                        <ButtonText className="uppercase" onClick={onClose}>
                            {i18n._(t`Close`)}
                        </ButtonText>
                    </div>
                </>
            )}
            {state.loading && !state.signed && (
                <div className="walletNotice mt-2">{i18n._(t`You need to sign the transaction in your wallet`)}</div>
            )}
        </StakeDepositSC>
    )
}

export default memo(StakeDeposit)
