/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useRef } from 'react'
import * as Q from 'q'
import * as moment from 'moment'
import * as klinecharts from 'klinecharts'
import { io } from 'socket.io-client'
import './index.css'

interface Price {
    timestamp: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    money?: number;
}

let chart: klinecharts.Chart | null = null

const inited = Q.defer()

const socket = io('ws://localhost:3000', {
    reconnectionDelayMax: 10000,
})

socket.on('connect', () => {
    if (socket.connected) {
        inited.resolve()
    }
})

socket.on('priceResult', (data: string) => {
    if (chart) {
        const price = JSON.parse(data) as Price[]

        chart!.applyNewData(price.map((v) => ({
            ...v,
            timestamp: moment(v.timestamp).valueOf(),
        })))
    }
})

const disconnect = () => {
    socket.disconnect()
}

const getPrice = () => {
    socket.emit('price', '000002.XSHE', '2014-01-01', '2020-01-01')
}

export default function Chart() {
    const divEl = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (divEl.current) {
            chart = klinecharts.init(divEl.current)
        }
        inited.promise.then(() => getPrice())
        return disconnect
    }, [])
    return (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div className="container" ref={divEl} />
    )
}
