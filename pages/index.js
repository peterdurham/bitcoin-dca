import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
  const intervals = [7, 14, 30, 60, 90, 120, 180, 270, 365, 730, 1096, 1461, 1826]
  const [prices, setPrices] = useState([])
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    const fetchBitcoinPrices = async () => {
      const url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=max&interval=hourly'
      return await fetch(url)
        .then((response) => {
          return response.json();
        })
        .then((parsed) => {
          setPrices(parsed.prices.reverse().slice(0, 1826));
        });
    }
    fetchBitcoinPrices()
  }, [])

  useEffect(() => {
    if (prices.length > 0) {
      setupChartData(prices)
    }
  }, [prices])

  const setupChartData = () => {
    const allData = intervals.map((interval) => getRowData(interval))
    setChartData(allData)
  }

  const getRowData = (interval) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const rowDataAverage = prices.slice(0, interval).reduce((acc, cur) => {
      return acc + cur[1]
    }, 0) / interval;
    const averages = days.map((day, index) => {
      const pricesArray = [...prices].slice(0, interval)
      const filtered = pricesArray.filter((price) => new Date(price[0]).getDay() === index)
      const average = filtered.reduce((acc, cur) => {
        return acc + cur[1]
      }, 0) / filtered.length;
      return average;
    })
    return [rowDataAverage, ...averages]
  }

  if (chartData.length === 0) return <div>loading</div>

  return (
    <div className="container">
      <Head>
        <title>Bitcoin DCA by day of week</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header title="Bitcoin DCA by day of week" />
        <p className='subheader'>
          This chart displays the variation (%) from the average bitcoin price based on the day of the week. Chart is up to date with live exchange data.
          <br></br><br></br>
          The <span className="bold italic">best time to buy historically</span> is when the number is <span className="bold red">most red</span>. Large price spikes in either direction can bias the data, especially on shorter timeframes.
        </p>
        <div className="table">
          <div className="tr">
            <div className="th first-header">Last</div>
            {['Average', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((label) => <div className="th">{label}</div>)}
          </div>
          {intervals.map((interval, index) => {
            return <div className="tr" key={index}>
              {interval < 365
                ? <div className='td'>{interval} days</div>
                : <div className='td'>{(interval / 365).toFixed(0)} year{interval > 700 && 's'}</div>}

              {chartData[index].map((average, index, array) => {
                if (index === 0) return <div className="td percent" key={index}>${average.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                const percentChange = (((average.toFixed(0) - array[0]) / array[0]) * 100).toFixed(2)
                return (
                  <div className={"td percent " + (percentChange > 0 ? 'green ' : 'red ') + (Math.abs(percentChange) > 1 ? 'bold ' : '')} key={index}>
                    {percentChange}
                  </div>
                )
              })}
            </div>
          })}
        </div>
      </main>
      <Footer />
      <style jsx>{`
        .subheader { width: 420px; margin: 0 auto; margin-bottom: 40px; }
        .table { width: 1000px; margin: 0 auto; }
        .th { font-weight: 700; }
        .tr { display: flex; justify-content: space-between; }
        .tr .td, .tr .th { width: 12.5%; height: 24px; }
        .th { text-align: right; }
        .first-header { text-align: left; }
        .percent { text-align: right; }
        .bold { font-weight: 700; }
        .italic { font-style: italic; }
        .green { color: green; }
        .red { color: red; }
      `}</style>
    </div>
  )
}
