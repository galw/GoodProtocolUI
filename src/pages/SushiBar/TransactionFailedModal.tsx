import React from 'react'
import Modal from '../../components/Modal'
import RejectedIcon from '../../assets/images/transaction-rejected.png'
import { CloseIcon } from '../../theme'
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'

interface TransactionFailedModalProps {
    isOpen: boolean
    onDismiss: () => void
}

export default function TransactionFailedModal({ isOpen, onDismiss }: TransactionFailedModalProps) {
    const { i18n } = useLingui()

    return (
        <Modal isOpen={isOpen} onDismiss={onDismiss} padding={28}>
            <div className=" h-60">
                <div className="flex justify-end">
                    <CloseIcon onClick={onDismiss} />
                </div>
                <div className="flex justify-center">
                    <img className="w-24" src={RejectedIcon} alt="transaction rejected" />
                </div>
                <div className="flex items-baseline justify-center flex-nowrap h4 mt-3">
                    <p className="">{i18n._(t`Uh Oh!`)}&nbsp;</p>
                    <p className="pink">{i18n._(t`Transaction rejected.`)}</p>
                </div>
                <div className="flex justify-center mt-5">
                    <button onClick={onDismiss} className="flex justify-center items-center w-full h-12 rounded lg  ">
                        {i18n._(t`Dismiss`)}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
