import React from 'react';
import { ModalOverlay } from '../../panel_control/components/DashboardUI';

const ScheduleModal = ({ onClose, onSubmit, scheduling, approvedApps, appointmentData, setAppointmentData }) => {
    return (
        <ModalOverlay title="Agendar Entrevista" onClose={onClose}>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                    <p>Selecciona una postulación APROBADA.</p>
                </div>
                <select
                    className="w-full p-3 bg-slate-50 border rounded-xl"
                    onChange={(e) =>
                        setAppointmentData({
                            ...appointmentData,
                            appId: e.target.value,
                        })
                    }
                    required
                >
                    <option value="">-- Selecciona Postulación --</option>
                    {approvedApps.map((app) => (
                        <option key={app.id} value={app.id}>
                            {app.opportunity_title}
                        </option>
                    ))}
                </select>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="date"
                        className="w-full p-3 bg-slate-50 border rounded-xl"
                        onChange={(e) =>
                            setAppointmentData({
                                ...appointmentData,
                                date: e.target.value,
                            })
                        }
                        required
                    />
                    <input
                        type="time"
                        className="w-full p-3 bg-slate-50 border rounded-xl"
                        onChange={(e) =>
                            setAppointmentData({
                                ...appointmentData,
                                time: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={scheduling}
                    className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl"
                >
                    {scheduling ? '...' : 'Confirmar'}
                </button>
            </form>
        </ModalOverlay>
    );
};

export default ScheduleModal;
