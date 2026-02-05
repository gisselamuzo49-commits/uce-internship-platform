import React from 'react';
import { Calendar, User } from 'lucide-react';

const AppointmentsSection = ({ appointments }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Calendar className="text-blue-600" /> Agenda de Entrevistas
            </h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {appointments.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-slate-400 font-bold">
                            No hay entrevistas programadas.
                        </p>
                    </div>
                ) : (
                    appointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="flex flex-col md:flex-row items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-50 p-3 rounded-xl text-blue-600 font-black text-center min-w-[70px] border border-slate-200">
                                    {appt.time}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">
                                        {appt.opportunity_title}
                                    </h4>
                                    <p className="text-sm text-slate-500 flex items-center gap-2">
                                        <User size={12} />
                                        {appt.student_name}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                                    {appt.date}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AppointmentsSection;
