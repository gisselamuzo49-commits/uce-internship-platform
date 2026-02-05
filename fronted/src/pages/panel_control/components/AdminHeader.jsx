import React from 'react';

const AdminHeader = ({ userName }) => {
    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-black text-slate-900">
                    Panel de Control
                </h1>
                <p className="text-slate-500">
                    Bienvenido, Administrador {userName}
                </p>
            </div>
        </div>
    );
};

export default AdminHeader;
