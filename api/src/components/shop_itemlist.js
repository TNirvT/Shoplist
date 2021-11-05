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
  
  function dataRearrange(dates, prices) {
    let pricesFormatted = [];
    const pricesObject = Object.fromEntries(dates.map( (_, i) => [dates[i], prices[i]] ));
    for (let i = 0; i < daysLabelArr.length; i++) {
      const price = pricesObject[daysLabelArr[i]];
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
      //     'dates': [timestamp(10 digit), ...],
      //     'prices': [float | None, ...]
      //   },
      //   ...
      // ]
      for (let i = 0; i < rawData.length; i++) {
        let datesNew = [];
        for (let j = 0; j < rawData[i].dates.length; j++) {
          const dateUTC = new Date(rawData[i].dates[j] * 1000).toISOString().substr(0,10);
          datesNew.push(dateUTC);
        };
        rawData[i].dates = datesNew;
        console.log(`${rawData[i].dates}`);
      };
      setChartDataArr(dataRearrange(rawData[0].dates, rawData[0].prices));
      console.log("get user history done");
    }).catch(err => {
      if (err) {
        setMessage(err.message);
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
    <button onClick={() => dataRearrange(["2021-11-01"],[1.0])}>Data Rearrange</button><br/>
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