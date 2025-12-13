import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function PriceChart({ coinId = 'ethereum', currency = 'usd' }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        // Lấy dữ liệu 7 ngày qua
        const url = `/api/coingecko/coins/${coinId}/market_chart?vs_currency=${currency}&days=7`;
        const res = await axios.get(url);
        
        // Format dữ liệu cho Recharts
        const formattedData = res.data.prices.map(item => ({
          time: new Date(item[0]).toLocaleDateString(),
          price: item[1]
        }));
        
        setData(formattedData);
      } catch (err) {
        console.error("Lỗi tải biểu đồ");
      }
    };
    fetchChart();
  }, [coinId, currency]);

  return (
    <div style={{ height: 300, width: '100%', marginTop: 20 }}>
      <h4 style={{marginBottom: 10}}>Chart (7 Days)</h4>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip 
            contentStyle={{backgroundColor: '#333', border: 'none', borderRadius: 8, color: '#fff'}}
            formatter={(value) => [value.toLocaleString(), currency.toUpperCase()]}
          />
          <Area type="monotone" dataKey="price" stroke="#8884d8" fillOpacity={1} fill="url(#colorPrice)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}