import React, { memo, useEffect, useMemo, useReducer } from 'react'
import { StakeDepositSC } from './styled'
import Title from '../../../components/gd/Title'
import AsyncTokenIcon from '../../../kashi/components/AsyncTokenIcon'
import { Switch } from '../styled'
import SwapInput from '../../Swap/SwapInput'
import { ButtonAction } from '../../../components/gd/Button'
import { Stake, approve, stake as deposit, getTokenPriceInUSDC } from '../../../sdk/staking'
import useActiveWeb3React from '../../../hooks/useActiveWeb3React'
import { useTokenBalance } from '../../../state/wallet/hooks'
import { Token } from '@sushiswap/sdk'
import useWeb3 from '../../../hooks/useWeb3'

export interface StakeDepositModalProps {
    stake: Stake
    onDeposit?: () => any
}

type Action<T extends string, P = never> = [P] extends [never]
    ? { type: T }
    : P extends undefined
    ? { type: T; payload?: P }
    : { type: T; payload: P }

const initialState = {
    token: 'A' as 'A' | 'B', // stake.tokens.A or stake.tokens.B,
    value: '',
    dollarEquivalent: undefined as undefined | string,
    approved: false,
    loading: false,
    error: undefined as undefined | string
}

const StakeDeposit = ({ stake, onDeposit }: StakeDepositModalProps) => {
    const { chainId, account } = useActiveWeb3React()
    const web3 = useWeb3()

    const [state, dispatch] = useReducer(
        (
            state: typeof initialState,
            action:
                | Action<'TOGGLE_TOKEN', boolean>
                | Action<'TOGGLE_LOADING'>
                | Action<'CHANGE_VALUE', string>
                | Action<'CHANGE_APPROVED', string | undefined>
                | Action<'SET_ERROR', Error>
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
                default:
                    return state
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
                payload: e
            })
        } finally {
            dispatch({ type: 'TOGGLE_LOADING' })
        }
    }

    return (
        <StakeDepositSC className="p-4">
            <Title className="flex space-x-2 items-center justify-center mb-2">
                {state.approved && 'Deposit overview'}
                {!state.approved && (
                    <>
                        <span>STAKE</span>
                        <AsyncTokenIcon
                            address={stake.tokens.A.address}
                            chainId={chainId}
                            className="block w-5 h-5 rounded-full"
                        />
                        <span>{stake.tokens.A.symbol}</span>
                    </>
                )}
            </Title>
            {state.error && <div className="error mb-2">{state.error}</div>}
            {state.approved && (
                <div className="flex justify-between items-start">
                    <div className="amount">amount</div>
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
            )}
            {!state.approved && (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <span>How much would you like to deposit?</span>
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
                        balance={tokenToDepositBalance?.toSignificant(4)}
                        autoMax
                        disabled={state.loading}
                        onMax={() =>
                            dispatch({
                                type: 'CHANGE_VALUE',
                                payload: tokenToDepositBalance?.toFixed() ?? '0'
                            })
                        }
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
                                    await approve(web3!, stake.address, state.value, state.token === 'B')
                                ])
                                dispatch({
                                    type: 'CHANGE_APPROVED',
                                    payload: tokenPriceInUSDC?.toSignificant(6) ?? ''
                                })
                            })
                        }
                    >
                        {state.loading ? 'APPROVING' : !account ? 'Connect wallet' : 'APPROVE'}
                    </ButtonAction>
                </>
            )}
            {state.approved && (
                <div className="px-2">
                    <ButtonAction
                        className="mt-6"
                        disabled={state.loading}
                        onClick={() =>
                            withLoading(async () => {
                                await deposit(web3!, stake.address, state.value, state.token === 'B')
                                if (onDeposit) onDeposit()
                            })
                        }
                    >
                        DEPOSIT
                    </ButtonAction>
                </div>
            )}
            {state.loading && <div className="walletNotice mt-2">You need to sign the transaction in your wallet</div>}
        </StakeDepositSC>
    )
}

export default memo(StakeDeposit)
