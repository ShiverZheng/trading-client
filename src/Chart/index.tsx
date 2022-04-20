import { useEffect, useRef, memo } from 'react'
import Q from 'q'
import dayjs from 'dayjs'
import { io } from 'socket.io-client'
import * as klinecharts from 'klinecharts'
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

function Chart() {
    const divEl = useRef<HTMLDivElement>(null)

    const inited = Q.defer<void>()

    const applyNewData = (chartInstance: klinecharts.Chart, price: Price[]) => {
        const data = price.map((v) => ({
            ...v,
            timestamp: dayjs(v.timestamp).valueOf(),
        }))
        chartInstance.applyNewData(data)
    }

    const updateData = (chartInstance: klinecharts.Chart, price: Price) => {
        const data = { ...price, timestamp: dayjs(price.timestamp).valueOf() }
        chartInstance.updateData(data)
    }

    const getHistoryPrice = async (code: string, startAt: string, endAt: string): Promise<Price[]> => {
        const res = await fetch(`http://localhost:8080/stock/price?code=${code}&startAt=${startAt}&endAt=${endAt}`, {
            method: 'GET',
        })
        if (res.status === 200) {
            const json = await res.json()
            return json
        }
        return []
    }

    useEffect(() => {
        if (divEl.current) {
            chart = klinecharts.init(divEl.current)
        }
        const socket = io('ws://localhost:8080', {
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
                updateData(chart, price[0])
            }
        })
        const syncPrice = () => {
            socket.emit('price', '000002.XSHE')
        }

        const disconnect = () => {
            socket.disconnect()
            klinecharts.dispose(divEl.current!)
        }

        inited.promise.then(() => syncPrice())
        return disconnect
    }, [inited])

    useEffect(() => {
        const now = dayjs()
        const aMonthAgo = now.subtract(1, 'month')
        const startAt = aMonthAgo.format('YYYY-MM-DD HH:MM:ss')
        const endAt = now.format('YYYY-MM-DD HH:MM:ss');
        (async () => {
            const price = await getHistoryPrice('000002.XSHE', startAt, endAt)
            if (chart) {
                applyNewData(chart, price)
            }
        })()
    })

    return (
        <div className="container" ref={divEl} />
    )
}
export default memo(Chart)
