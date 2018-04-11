import React, { Component } from 'react'
import styled from 'styled-components'
import { createObserver, collect } from 'dop'

import { routes } from '/store/router'
import styles from '/const/styles'

import state from '/store/state'
import { getParamsFromLocation, getAsset } from '/store/getters'
// import { assetDelete, addNotification, setHref } from '/store/actions'

import Div from '/components/styled/Div'
import ButtonBig from '/components/styled/ButtonBig'
import RadioButton from '/components/styled/RadioButton'
// import CenterElement from '/components/styled/CenterElement'

export default class Addresses extends Component {
    componentWillMount() {
        this.observer = createObserver(m => this.forceUpdate())
        this.observer.observe(state.view)

        const { asset_id } = getParamsFromLocation()
        this.asset = getAsset(asset_id)

        // Initial state
        state.view = {
            addresses: this.asset.addresses.map(addr => ({
                address: addr,
                balance: 0,
                loading: false
            }))
        }

        // binding
        // this.onChangeEncryption = this.onChangeEncryption.bind(this)
    }

    fetchBalances() {
        resolveAll
    }

    render() {
        return React.createElement(AddressesTemplate, {
            address_current: this.asset.address,
            addresses: state.view.addresses,
            symbol: this.asset.symbol
        })
    }
}

function AddressesTemplate({ address_current, addresses, symbol }) {
    const loading_ico = (
        <img src="/static/image/loading.gif" width="22" height="22" />
    )
    return (
        <Div>
            <Transactions>
                {addresses.map(addr => {
                    return (
                        <Transaction
                            selected={address_current === addr.address}
                        >
                            <TransactionInner onClick={e => {}}>
                                <TransactionItemRadio>
                                    <RadioButton
                                        checked={
                                            address_current === addr.address
                                        }
                                    />
                                </TransactionItemRadio>
                                <TransactionItemLeft>
                                    {addr.address}
                                </TransactionItemLeft>
                                <TransactionItemRight>
                                    {addr.loading
                                        ? loading_ico
                                        : `${addr.balance} ${symbol}`}
                                </TransactionItemRight>
                            </TransactionInner>
                        </Transaction>
                    )
                })}
            </Transactions>
            <Total>10.231 BTC</Total>
        </Div>
    )
}

export const Transactions = styled.div`
    clear: both;
`

export const Transaction = styled.div`
    clear: both;
    cursor: pointer;
    color: ${props => (props.selected ? 'black' : styles.color.front3)};
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: ${props =>
        props.selected ? styles.color.background1 : 'transparent'};
    &:hover {
        background-color: ${styles.color.background1};
    }
`

export const TransactionInner = styled.div`
    height: 32px;
    padding: 12px 12px 0 12px;
`

export const TransactionItemRadio = styled.div`
    float: left;
    margin-right: 10px;
    padding-left: 5px;
    padding-top: 1px;
`
export const TransactionItemLeft = styled.div`
    float: left;
    font-weight: bold;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 85%;
`
export const TransactionItemRight = styled.div`
    float: right;
    font-weight: bold;

    ${styles.media.fourth} {
        float: left;
        font-size: 12px;
        margin-left: 35px;
    }
`

export const Total = styled.div`
    border-top: 2px solid #f3f6f8;
    color: #007196;
    font-weight: 900;
    text-align: right;
    padding: 12px;
    font-size: 16px;
`
