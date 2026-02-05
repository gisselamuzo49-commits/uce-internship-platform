import React from 'react';
import {
    X,
    Mail,
    Loader,
    Download,
    Briefcase,
    GraduationCap,
} from 'lucide-react';

const StudentProfileModal = ({
    viewingStudentId,
    basicStudentInfo,
    fullProfile,
    loadingProfile,
    handleCloseProfile,
    generateStudentCV,
}) => {
    if (!viewingStudentId) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50 rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                            {basicStudentInfo?.name?.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-800">
                                {basicStudentInfo?.name}
                            </h3>
                            <p className="text-slate-500 flex items-center gap-2 text-sm">
                                <Mail size={14} /> {basicStudentInfo?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCloseProfile}
                        className="p-2 hover:bg-slate-200 rounded-full text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto space-y-8 min-h-[300px]">
                    {loadingProfile ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                            <Loader className="animate-spin text-blue-600" size={32} />
                            <p>Cargando información detallada...</p>
                        </div>
                    ) : !fullProfile ? (
                        <div className="text-center text-red-500">
                            <p>No se encontraron datos detallados.</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-end">
                                <button
                                    onClick={() =>
                                        generateStudentCV(fullProfile, basicStudentInfo)
                                    }
                                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-md"
                                >
                                    <Download size={16} /> Descargar Hoja de Vida
                                </button>
                            </div>
                            <section>
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Briefcase className="text-purple-600" /> Experiencia
                                </h4>
                                {fullProfile.experiences &&
                                    fullProfile.experiences.length > 0 ? (
                                    fullProfile.experiences.map((exp, i) => (
                                        <div
                                            key={i}
                                            className="mb-4 pl-4 border-l-2 border-purple-200"
                                        >
                                            <h5 className="font-bold">{exp.role}</h5>
                                            <p className="text-sm text-purple-600">
                                                {exp.company}
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {exp.start_date} - {exp.end_date || 'Actualidad'}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic bg-slate-50 p-3 rounded">
                                        Sin experiencia registrada.
                                    </p>
                                )}
                            </section>
                            <section>
                                <h4 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <GraduationCap className="text-orange-500" /> Educación
                                </h4>
                                {fullProfile.certifications &&
                                    fullProfile.certifications.length > 0 ? (
                                    fullProfile.certifications.map((cert, i) => (
                                        <div
                                            key={i}
                                            className="mb-2 bg-orange-50 p-3 rounded-lg flex justify-between"
                                        >
                                            <span className="font-bold text-sm">
                                                {cert.title}
                                            </span>
                                            <span className="text-xs font-bold text-orange-700">
                                                {cert.year}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-400 italic bg-slate-50 p-3 rounded">
                                        Sin educación registrada.
                                    </p>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
