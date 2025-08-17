// components/ReminderCard.jsx
import { Calendar, Clock, AlertTriangle } from "lucide-react";

export default function ReminderCard({ reminder }) {
  const { serviceName, expiryDate, plan, daysLeft, message } = reminder;
  
  // Determine urgency styling
  const getUrgencyStyle = (days) => {
    if (days === 0) return "border-red-500 bg-red-50 text-red-800";
    if (days === 1) return "border-orange-500 bg-orange-50 text-orange-800";
    return "border-yellow-500 bg-yellow-50 text-yellow-800";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 shadow-sm ${getUrgencyStyle(daysLeft)}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} />
            <h3 className="font-semibold text-lg">{serviceName}</h3>
            {plan && (
              <span className="text-sm px-2 py-1 bg-white rounded-full">
                {plan}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Expires: {formatDate(expiryDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-2xl font-bold ${
            daysLeft === 0 ? 'text-red-600' : 
            daysLeft === 1 ? 'text-orange-600' : 'text-yellow-600'
          }`}>
            {daysLeft === 0 ? '!' : daysLeft}
          </div>
          <div className="text-xs">
            {daysLeft === 0 ? 'TODAY' : 'DAYS LEFT'}
          </div>
        </div>
      </div>
    </div>
  );
}