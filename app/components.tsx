'use client'
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

const performanceChart = () => {
  const data = [{name: 'Dia 1', uv: 400, pv: 2400, amt: 2400}, {name: 'Dia 2', uv: 200, pv: 3000, amt: 2400}, {name: 'Dia 3', uv: 700, pv: 3000, amt: 2400}];
  return(
    <BarChart width={600} height={300} data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
      <Bar  dataKey="uv" stroke="#8884d8" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
    </BarChart>
  )
}

export const PerformanceChart = performanceChart