import './styles/index.css'
import '@fontsource/dm-sans/index.css'
import 'react-tabs/style/react-tabs.css'
import './bootstrap'

import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { KashiProvider } from 'kashi'
import React, { StrictMode, useState, useEffect } from 'react'
import { isMobile } from 'react-device-detect'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { Text, Link, Image } from 'rebass'

import { Provider } from 'react-redux'
import { HashRouter as Router } from 'react-router-dom'
import Blocklist from './components/Blocklist'
import { NetworkContextName } from './constants'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import ListsUpdater from './state/lists/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import getLibrary from './utils/getLibrary'
import LanguageProvider from 'language'
import { createGlobalStyle } from 'styled-components'
import { Web3ContextProvider } from './hooks/useWeb3'
import Modal from './components/Modal'
import LogoImg from './assets/svg/logo_custom.svg'
import { ButtonAction } from './components/gd/Button'

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

if (!!window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false
}

const GOOGLE_ANALYTICS_ID: string | undefined = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
if (typeof GOOGLE_ANALYTICS_ID === 'string') {
} else {
}

function Updaters() {
    return (
        <>
            <ListsUpdater />
            <UserUpdater />
            <ApplicationUpdater />
            <MulticallUpdater />
        </>
    )
}

const Input = styled.input<{ error?: boolean }>`
    border-radius: 5px;
    width: 100%;
`
const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 30px;
    padding: 10%;
    justify-content: center;
    align-items: center;
`

function CustomApp() {
    return <App />;
}

const GlobalStyle = createGlobalStyle`
  body {
      color: ${({ theme }) => theme.color.text1};
  }

  ::-webkit-scrollbar {
    background-color: ${({ theme }) => theme.color.main};
    width: 16px;
  }
  ::-webkit-scrollbar-track {
    background-color: ${({ theme }) => theme.color.main};
  }
  ::-webkit-scrollbar-thumb {
    background-color: #babac0;
    border-radius: 16px;
    border: 4px solid ${({ theme }) => theme.color.main};
  }
  ::-webkit-scrollbar-button {
    display:none;
  }
`

ReactDOM.render(
    <StrictMode>
        <Web3ReactProvider getLibrary={getLibrary}>
            <Web3ProviderNetwork getLibrary={getLibrary}>
                <Web3ContextProvider>
                    <Provider store={store}>
                        <LanguageProvider>
                            <Blocklist>
                                <Updaters />
                                <ThemeProvider>
                                    <GlobalStyle />
                                    <KashiProvider>
                                        <Router>
                                            <CustomApp />
                                        </Router>
                                    </KashiProvider>
                                </ThemeProvider>
                            </Blocklist>
                        </LanguageProvider>
                    </Provider>
                </Web3ContextProvider>
            </Web3ProviderNetwork>
        </Web3ReactProvider>
    </StrictMode>,
    document.getElementById('root')
)
