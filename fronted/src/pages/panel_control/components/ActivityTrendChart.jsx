import React from 'react';
import { Activity } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const ActivityTrendChart = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="text-rose-500" /> Tendencia de Postulaciones
                (7 días)
            </h2>
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data || []}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis
                            dataKey="fecha"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="postulaciones"
                            stroke="#f43f5e"
                            strokeWidth={4}
                            dot={{
                                r: 6,
                                fill: '#f43f5e',
                                strokeWidth: 2,
                                stroke: '#fff',
                            }}
                            activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityTrendChart;
