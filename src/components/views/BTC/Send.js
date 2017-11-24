import React, { Component } from 'react'
import styled from 'styled-components'
import { createObserver, collect } from 'dop'
import Big from 'big.js'

import { Assets } from '/api/Assets'
import { parseNumber, decimalsMax } from '/api/numbers'

import state from '/store/state'
import { fetchBalance } from '/store/actions'
import { getAsset, formatCurrency, convertBalance } from '/store/getters'

import styles from '/const/styles'

import Div from '/components/styled/Div'
import Span from '/components/styled/Span'
import Input from '/components/styled/Input'
import InputDouble from '/components/styled/InputDouble'
import Button from '/components/styled/Button'
import ButtonBig from '/components/styled/ButtonBig'
import CenterElement from '/components/styled/CenterElement'

export default class Send extends Component {
    componentWillMount() {
        this.asset_id = state.location.path[1]
        this.asset = getAsset(this.asset_id)
        this.Asset = Assets[this.asset.symbol] // Storing Asset api (Asset.BTC, Asset.ETH, ...)

        this.observer = createObserver(m => this.forceUpdate())
        this.observer.observe(state.view)

        // Initial state
        this.amount = 0
        this.fee = 0
        state.view = {
            address_input: '',
            address_input_error: false,
            amount1_input: 0, // BTC
            amount2_input: 0, // FIAT
            fee_recomended: 0,
            fee_input: 0,
            password_input: ''
        }

        // binding
        this.onChangeAddress = this.onChangeAddress.bind(this)
        this.onChangeAmount1 = this.onChangeAmount1.bind(this)
        this.onChangeAmount2 = this.onChangeAmount2.bind(this)
        this.onChangeMax = this.onChangeMax.bind(this)
        this.onChangePassword = this.onChangePassword.bind(this)

        this.fetchBalance()
        this.fetchRecomendedFee()
    }
    componentWillUnmount() {
        this.observer.destroy()
    }
    shouldComponentUpdate() {
        return false
    }

    fetchBalance() {
        fetchBalance(this.asset_id)
    }

    fetchRecomendedFee() {
        this.Asset.fetchRecomendedFee(this.asset.address).then(fee => {
            const collector = collect()
            state.view.fee_input = state.view.fee_recomended = Big(fee)
            collector.emit()
        })
    }

    onChangeAddress(e) {
        const collector = collect()
        const value = e.target.value.trim()
        state.view.address_input = value
        if (this.Asset.isAddressCheck(value)) {
            state.view.address_input_error = false
        } else {
            state.view.address_input_error = true
        }
        collector.emit()
    }

    onChangeAmount1(e) {
        const collector = collect()
        state.view.amount1_input = e.target.value
        delete state.view.amount2_input
        collector.emit()
    }
    onChangeAmount2(e) {
        const collector = collect()
        state.view.amount2_input = e.target.value
        delete state.view.amount1_input
        collector.emit()
    }

    onChangeMax(e) {
        const collector = collect()
        state.view.amount1_input = this.getMax()
        delete state.view.amount2_input
        collector.emit()
    }

    onChangePassword(e) {
        const value = e.target.value.trim()
        state.view.password_input = value
    }

    getMax() {
        const max = Big(this.asset.balance).minus(this.fee)
        return max.gt(0) ? max : 0
    }

    get isEnoughBalance() {
        return this.amount.lte(this.getMax())
    }

    get isValidForm() {
        return (
            !state.view.address_input_error &&
            state.view.address_input.length > 0 &&
            state.view.password_input.length > 0 &&
            this.amount.gt(0) &&
            this.fee.gt(0)
        )
    }

    render() {
        let amount1, amount2
        const symbol = this.asset.symbol
        const price = state.prices[symbol]

        if (state.view.amount1_input !== undefined) {
            amount1 = state.view.amount1_input
            amount2 = decimalsMax(
                Big(state.prices[symbol]).times(parseNumber(amount1)),
                2
            )
        } else {
            amount2 = state.view.amount2_input
            amount1 = decimalsMax(
                Big(parseNumber(amount2)).div(state.prices[symbol]),
                10
            )
        }

        this.amount = Big(parseNumber(amount1))
        this.fee = Big(parseNumber(state.view.fee_input))
        const isEnoughBalance = this.isEnoughBalance

        return React.createElement(SendTemplate, {
            color: this.Asset.color,
            address_input: state.view.address_input,
            address_input_error: state.view.address_input_error,
            amount1_input: amount1,
            amount2_input: amount2,
            symbol_crypto: symbol,
            symbol_currency: state.currency,
            fee: this.fee,
            fee_fiat: formatCurrency(
                convertBalance(this.asset.symbol, this.fee),
                2
            ),
            password_input: state.view.password_input,
            isEnoughBalance: isEnoughBalance,
            isValidForm: this.isValidForm && this.isEnoughBalance,
            onChangeAddress: this.onChangeAddress,
            onChangeAmount1: this.onChangeAmount1,
            onChangeAmount2: this.onChangeAmount2,
            onChangeMax: this.onChangeMax,
            onChangePassword: this.onChangePassword
        })
    }
}

function SendTemplate({
    color,
    address_input,
    address_input_error,
    amount1_input,
    amount2_input,
    symbol_crypto,
    symbol_currency,
    fee,
    fee_fiat,
    password_input,
    isEnoughBalance,
    isValidForm,
    onChangeAddress,
    onChangeAmount1,
    onChangeAmount2,
    onChangeMax,
    onChangePassword
}) {
    return (
        <CenterElement width="500px" media={styles.media.third}>
            <Div>
                <Input
                    value={address_input}
                    error="Invalid address"
                    invalid={address_input_error}
                    onChange={onChangeAddress}
                    placeholder="Address"
                    width="100%"
                    text-align="center"
                />
            </Div>
            <Div padding-top="10px">
                <Div float="left">
                    <Button
                        line-height="54px"
                        width="72px"
                        font-size="15px"
                        border-radius="10px 0 0 10px"
                        border-right="1px solid transparent"
                        onClick={onChangeMax}
                    >
                        Max
                    </Button>
                </Div>
                <Div float="left" width="calc(100% - 72px)">
                    <InputDouble
                        invalid={!isEnoughBalance}
                        error="Not enough funds"
                        value1={amount1_input}
                        value2={amount2_input}
                        color1={color}
                        color2="#000"
                        label1={symbol_crypto}
                        label2={symbol_currency}
                        onChange1={onChangeAmount1}
                        onChange2={onChangeAmount2}
                    />
                </Div>
            </Div>
            <Div clear="both" />

            <Div text-align="center" padding-top="10px">
                <TextFee href="#">
                    <span>Recomended Network Fee </span>
                    <Span color={color} font-weight="bold">
                        {fee}{' '}
                    </Span>
                    <Span color="#000" font-weight="bold">
                        {fee_fiat}
                    </Span>
                </TextFee>
            </Div>

            <Div padding-top="20px">
                <Input
                    placeholder="Password"
                    type="password"
                    width="100%"
                    text-align="center"
                    value={password_input}
                    onChange={onChangePassword}
                />
            </Div>

            <Div padding-top="10px">
                <ButtonBig
                    disabled={!isValidForm}
                    font-size="14px"
                    width="100%"
                >
                    Next
                </ButtonBig>
            </Div>
        </CenterElement>
    )
}

const TextFee = styled.a`
    font-size: 12px;
    color: ${styles.color.grey1};
    &:hover {
        color: #000;
    }
`
