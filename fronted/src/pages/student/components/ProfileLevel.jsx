import React from 'react';
import { Award, CheckCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const ProfileLevel = ({ studentScore }) => {
    return (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg col-span-3 text-white flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
                <div className="z-10 max-w-lg">
                    <h3 className="text-2xl font-black mb-2 flex items-center gap-2">
                        <Award className="text-yellow-400" /> Nivel de Perfil
                    </h3>
                    <p className="text-slate-300 mb-4">
                        Completa cursos para llegar al 100%.
                    </p>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div
                                className={`p-1 rounded-full ${studentScore >= 20 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <CheckCircle size={14} />
                            </div>
                            <span>Registro completado (20%)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div
                                className={`p-1 rounded-full ${studentScore >= 60 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <CheckCircle size={14} />
                            </div>
                            <span>Postulación enviada (40%)</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div
                                className={`p-1 rounded-full ${studentScore >= 100 ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <CheckCircle size={14} />
                            </div>
                            <span>Formación Académica (40%)</span>
                        </div>
                    </div>
                </div>
                <div className="z-10 w-48 h-48 relative flex items-center justify-center mt-6 md:mt-0">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie
                                data={[
                                    { value: studentScore },
                                    { value: 100 - studentScore },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell fill="#10B981" /> <Cell fill="#334155" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                        <span className="text-4xl font-black">{studentScore}%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileLevel;
