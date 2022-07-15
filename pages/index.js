import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
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
          setPrices(parsed.prices.reverse().slice(0, 1800));
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
    const intervals = [10, 30, 60, 90, 180, 720, 1080, 1800]
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
  const intervals = [10, 30, 60, 90, 180, 720, 1080, 1800]
  return (
    <div className="container">
      <Head>
        <title>Bitcoin DCA by day of week</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Bitcoin DCA by day of week" />
        <p className='subheader'>
          This chart displays the variation from the average bitcoin price based on the day of the week. Chart is up to date with live exchange data.
        </p>

        <div className="table">
          <div className="tr">
            <div className="th"></div>
            <div className="th">Average</div>
            <div className="th">Sunday</div>
            <div className="th">Monday</div>
            <div className="th">Tuesday</div>
            <div className="th">Wednesday</div>
            <div className="th">Thursday</div>
            <div className="th">Friday</div>
            <div className="th">Saturday</div>
          </div>
          {intervals.map((interval, index) => {
            return <div className="tr" key={index}>
              <div className='td'>{interval} days</div>
              {chartData[index].map((average, index, array) => {

                if (index === 0) return <div className="td percent" key={index}>${average.toFixed(0)}</div>

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
        .table { width: 960px; margin: 0 auto; }
        .tr { display: flex; justify-content: space-between; }
        .tr .td, .tr .th { width: 12.5%; height: 24px; }

        .th { text-align: right; }
        .percent { text-align: right; }
        .bold { font-weight: 700; }
        .green { color: green; }
        .red { color: red; }
      `}</style>
    </div>
  )
}
