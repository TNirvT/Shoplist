import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

export default function ShopItemList() {
  const [message, setMessage] = useState("");
  const [listItems, setListItems] = useState([]);
  const [chartDataSets, setChartDataSets] = useState([]);
  const [showChart, setShowChart] = useState(false);
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
    // console.log(prices);

    let pricesFormatted = [];
    const pricesObject = Object.fromEntries(prices);
    for (const day of daysLabelArr) {
      const price = pricesObject[day];
      price ? pricesFormatted.push(price) : pricesFormatted.push(null);
    };
    // console.log(pricesFormatted);
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
      const colors = [
        "255, 99, 132",
        "255, 174, 33",
        "255, 33, 248",
        "235, 212, 40",
        "66, 82, 255",
        "50, 224, 34",
        "74, 213, 255",
        "255, 43, 15",
        "15, 239, 255",
        "235, 212, 40",
      ];

      setChartDataSets([]);
      // for (const source of rawData) {
      for (let i = 0; i < rawData.length; i++) {
        setChartDataSets(oldArr => [...oldArr, {
          label: rawData[i].item_name,
          data: dataRearrange(rawData[i].stamp_prices),
          fill: false,
          backgroundColor: `rgb(${colors[i % 10]})`,
          borderColor: `rgba(${colors[i % 10]}, 0.2)`,
        }]);
      };
      console.log("get user history done");
      setShowChart(true);
    }).catch(err => {
      if (err) {
        setMessage(err.message); // ???
      };
    });
  };

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
    <span>{message}</span><br/>
    <button onClick={priceUpdate}>Price update(user's items)</button><br/>
    <button onClick={getItemHistory}>Get Item History</button><br/>
    {
      showChart &&
      // chartDataSets.length &&
      <Line
        data={{
          labels: daysLabelArr,
          datasets: chartDataSets
        }}
        // data={tempData}
        width={500}
        height={200}
        options={{
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }}
      />
    }
    </React.Fragment>
  )
}