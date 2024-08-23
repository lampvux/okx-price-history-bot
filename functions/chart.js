
const convertArray = (arr) => arr.map((innerArray) =>
    innerArray.map((item) => {
      const number = parseFloat(item);
      return isNaN(number) ? item : number;
    }),
  );
  let price ;
let last3days = Date.now() - 259200000;
// console.log(last3days)
let getOhlvc = async() => {
    
    const requestOptions = {
    method: "GET",
    redirect: "follow"
    };
    try {
        const response =  await fetch('https://www.okx.com/api/v5/market/history-mark-price-candles?instId=BTC-USDT&bar=1m&limit=20&after='+last3days,requestOptions)
              const data = await response.json();
            //  console.log(data.data)   
                price = convertArray(data.data);
                //  console.log(price)
                
        }   
    
        catch (error) {
            console.error('Error fetching data:', error);
        }
    }
getOhlvc().then(()=>{
    
    // Initialize the chart
    Highcharts.chart('container', {
        chart: {
            type: 'candlestick',
             
            backgroundColor: {
                linearGradient: [0, 0, 500, 500],
                stops: [
                    [0, 'rgb(255, 255, 255)'],
                    [1, 'rgb(240, 240, 255)']
                ]
            },
            borderWidth: 2,
            plotBackgroundColor: 'rgba(255, 255, 255, .9)',
            plotShadow: true,
            plotBorderWidth: 1
        },
        rangeSelector: {
            selected: 1
        },
        title: {
            text: 'Candlestick Chart'
        },
        xAxis: {
            title : {
                text : 'Time(GMT)'
            },
            type: 'datetime',
            tickInterval: 60 * 1000 // 1 minute interval
        },
        yAxis: {
            title: {
                text: 'Price'
            }
        },
        plotOptions: {
            candlestick: {
                color: 'pink',
                lineColor: 'red',
                upColor: 'lightgreen',
                upLineColor: 'green',
            }
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: false
                }
            }
        },
        exporting: {
            enabled: true, 
        },
       

        series: [{
            name: '',
            data: price,
            
            dataGrouping: {
                units: [['minute', [1]]]
            },
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
   
})

