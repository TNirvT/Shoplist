import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";

export default function ShopItemList({setShowAdd}) {
  const [message, setMessage] = useState("");
  const [itemList, setItemList] = useState(null);
  const [chartDataSets, setChartDataSets] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [loading, setLoading] = useState(false);

  let rowsArr = []
  if (itemList) {
    rowsArr = itemList.map((item) =>
      <tr key={item.source_id.toString()}>
        <td className="overflow-hidden" style={{width:"80%"}}>
          {item.item_name}<br/>
          <a href={item.url} className="link-primary mx-2" target="_blank">{item.shop}</a>
          <span className="deleteBtn fst-italic mx-3" onClick={() => onDelete(item.product_id)}>delete</span>
        </td>
        <td style={{width:"20%"}}>${item.price}</td>
      </tr>
    )
  } else {
    rowsArr = []
  };

  function loadItemList() {
    setLoading(true);
    axios.get("/list_user_items").then(res => {
      setItemList(res.data);
      setLoading(false);
    }).catch(err => {
      if (err) setMessage(err.message);
    });
  };

  function onDelete(productID) {
    axios.delete("/remove_item", {
      params: {
        productID: productID,
      },
    }).then(res => {
      if (res.data.error) {
        setMessage(res.data.error);
        return
      };
      console.log(`onDelete, pid= ${productID}`);
      loadItemList();
    }).catch(err => {
      if (err) setMessage(err.message);
    })
  };
  
  function priceUpdate() {
    setLoading(true);
    axios.put("/user_price_history_update").then(res => {
      setLoading(false);
      setMessage("Datebase Updated!")
    }).catch(err => {
      if (err) setMessage(err.message);
    }).finally(loadItemList);
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

    let pricesFormatted = [];
    const pricesObject = Object.fromEntries(prices);
    for (const day of daysLabelArr) {
      const price = pricesObject[day];
      price ? pricesFormatted.push(price) : pricesFormatted.push(null);
    };
    return pricesFormatted
  };

  function getItemHistory() {
    axios.get("/get_user_items_history").then(res => {
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
        }])
      };
      console.log("get user history done");
      setShowChart(true);
    }).catch(err => {
      if (err) {
        setMessage(err.message);
        console.log(err.message);
      };
    });
  };

  useEffect(() => {
    loadItemList();
    console.log("useEffect: list");
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between">
        <div className="my-2">
          <h3>Tracking Items</h3>
        </div>
        <div className="my-2">
          <button className="btn btn-primary" onClick={setShowAdd}>⨁&nbsp;&nbsp;Add</button>
        </div>
      </div>
      <div className="m-2">
        <table className="table table-striped table-hover">
          <tbody>{rowsArr}</tbody>
        </table>
      </div>
      {
        loading &&
        <div className="loader"></div>
      }
      <span>{message}</span><br/>
      <button className="btn btn-primary my-1" onClick={priceUpdate}>Price update(user's items)</button><br/>
      <button className="btn btn-primary my-1" onClick={getItemHistory}>Get Item History</button><br/>
      {
        showChart &&
        <Line
          data={{
            labels: daysLabelArr,
            datasets: chartDataSets
          }}
          width={500}
          height={200}
          options={{
            scales: {
              y: {beginAtZero: true}
            }
          }}
        />
      }
    </div>
  )
}