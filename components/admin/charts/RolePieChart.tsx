import React from 'react';

interface RolePieChartProps {
    patientCount: number;
    doctorCount: number;
}

const RolePieChart: React.FC<RolePieChartProps> = ({ patientCount, doctorCount }) => {
    const total = patientCount + doctorCount;
    if (total === 0) {
        return <p className="text-dark-subtext">No patient or doctor data available.</p>;
    }

    const patientAngle = (patientCount / total) * 360;
    const doctorAngle = (doctorCount / total) * 360;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const patientPercent = patientCount / total;
    const [patientX, patientY] = getCoordinatesForPercent(patientPercent);
    
    const patientPath = `M1 0 A1 1 0 ${patientPercent > 0.5 ? 1 : 0} 1 ${patientX} ${patientY} L 0 0`;

    return (
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            <div className="w-40 h-40 flex-shrink-0">
                <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Doctor slice (full circle, to be covered by patient slice) */}
                    <circle cx="0" cy="0" r="1" fill="#31D0AA" />
                    {/* Patient slice */}
                    {patientAngle > 0 && patientAngle < 360 && <path d={patientPath} fill="#4299E1" />}
                </svg>
            </div>
            <div className="space-y-3 text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#4299E1] mr-2"></div>
                    <div>
                        <span className="font-bold">{patientCount} Patients</span>
                        <span className="text-dark-subtext ml-2">({((patientCount / total) * 100).toFixed(1)}%)</span>
                    </div>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#31D0AA] mr-2"></div>
                    <div>
                        <span className="font-bold">{doctorCount} Doctors</span>
                        <span className="text-dark-subtext ml-2">({((doctorCount / total) * 100).toFixed(1)}%)</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePieChart;
