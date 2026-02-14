interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgColor: string;
}

export default function StatsCard({ icon, label, value, bgColor }: StatsCardProps) {
  return (
    <div className="glass-effect-strong rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all card-hover-effect backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-700 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
