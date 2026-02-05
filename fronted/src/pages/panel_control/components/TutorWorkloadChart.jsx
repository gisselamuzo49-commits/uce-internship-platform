import React from 'react';
import { BarChart3 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

const TutorWorkloadChart = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-indigo-500" /> Carga de
                Tutores
            </h2>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data || []} layout="vertical">
                        <CartesianGrid
                            strokeDasharray="3 3"
                            horizontal={false}
                            stroke="#f1f5f9"
                        />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={80}
                            style={{ fontSize: '12px', fontWeight: 'bold' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            }}
                        />
                        <Bar
                            dataKey="estudiantes"
                            fill="#6366f1"
                            radius={[0, 4, 4, 0]}
                            barSize={20}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TutorWorkloadChart;
