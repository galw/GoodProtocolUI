import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Stakes from './pages/Stake'
import DatastudioDashboard from './pages/DatastudioDashboard'
import Swap from './pages/Swap'
import { RedirectHashRoutes, RedirectPathToSwapOnly } from './pages/SwapDeprecated/redirects'
import Portfolio from './pages/Portfolio'
import { useWeb3React } from '@web3-react/core'

function Routes(): JSX.Element {
    const { chainId } = useWeb3React()

    return (
        <Switch>
            <Route exact strict path="/dashboard" component={DatastudioDashboard} />
            <Route exact strict path="/swap" component={Swap} key={chainId} />
            <Route exact strict path="/stakes" component={Stakes} />
            <Route exact strict path="/portfolio" component={Portfolio} />
            <Route exact strict path="/" component={RedirectHashRoutes} />
            <Route component={RedirectPathToSwapOnly} />
        </Switch>
    )
}

export default Routes
