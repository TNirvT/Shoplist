import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

export default function ShopItemList() {
  const [message, setMessage] = useState("");
  const [listItems, setListItems] = useState([]);
  const [chartDataArr, setChartDataArr] = useState([]);
  const [loading, setLoading] = useState(false);

  function priceUpdate() {
    setLoading(true);
    axios.put("/user_price_history_update").then(res => {
      setLoading(false);
      setMessage("Datebase Updated!")
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };
  
  function listUserItems() {
    setLoading(true);
    axios.get("/list_user_items").then(res => {
      const userItems = res.data;
      let arr = userItems.map((userItem) =>
        <li key={userItem.source_id.toString()}>
          {userItem.item_name.substring(0,35)}
          {userItem.item_name.length > 35 && "..."}
          {" : $"}
          {userItem.price}
        </li>
      );
      setListItems(arr);
      setLoading(false);
    }).catch(err => {
      if (err) {
        setMessage(err.message);
      };
    });
  };
  
  function daysLabel() {
    let datesArr = [];
    const nowLocal = new Date();
    let iterDate = new Date(nowLocal);
    iterDate.setDate(iterDate.getDate()-29);
    while (iterDate <= nowLocal) {
      const indexDate = iterDate.toISOString().substr(0,10);
      // indexDate in UTC timezone, format: yyyy-mm-dd
      datesArr.push(indexDate);
      iterDate.setDate(iterDate.getDate()+1);
    }
    return datesArr
  };
  
  const daysLabelArr = daysLabel();
  
  function dataRearrange(prices) {
    for (let i = 0; i < prices.length; i++) {
      prices[i][0] = new Date(prices[i][0] * 1000).toISOString().substr(0, 10);
    };
    console.log(prices);

    let pricesFormatted = [];
    const pricesObject = Object.fromEntries(prices);
    for (const day of daysLabelArr) {
      const price = pricesObject[day];
      price ? pricesFormatted.push(price) : pricesFormatted.push(null);
    };
    console.log(pricesFormatted);
    return pricesFormatted
  };

  function getItemHistory() {
    axios.get("/get_user_items_history",).then(res => {
      let rawData = res.data;
      // rawData = [
      //   {
      //     'source_id': 1,
      //     'item_name': 'name',
      //     'user_alias': 'alias',
      //     'stamp_prices': [ [number(10 digit timestamp), number(price)|None], ... ]
      //   },
      //   ...
      // ]
      setChartDataArr([]);
      for (const source of rawData) {
        setChartDataArr(oldArr => [...oldArr, dataRearrange(source.stamp_prices)]);
      };
      console.log("get user history done");
    }).catch(err => {
      if (err) {
        setMessage(err.message); // ???
      };
    });
  };

  // tiral dataset
  const tempData = {
    labels: ['1', '2', '3', '4', '5', '6'],
    datasets: [
      {
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        fill: false,
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };
  ////////////////

  useEffect(() => {
    listUserItems();
    console.log("useEffect: list");
  }, []);

  return (
    <React.Fragment>
    <h2>Item List</h2>
    <ul>
      {listItems}
    </ul>
    {loading &&
      <div className="loader"></div>
    }
    <span>{message}</span>{message && <br/>}
    <button onClick={priceUpdate}>Price update(user's items)</button><br/>
    <button onClick={getItemHistory}>Get Item History</button><br/>
    <button onClick={() => dataRearrange([[1636157461.137333, 1.0],[1635898389.139973, 0.5]])}>Data Rearrange</button><br/>
    {
      chartDataArr.length ?
      <Line
        data={tempData}
        width={500}
        height={200}
        options={{
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      /> : <span></span>
    }
    </React.Fragment>
  )
}