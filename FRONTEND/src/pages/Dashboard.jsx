import { motion } from 'framer-motion';

/**
 * Dashboard — Placeholder (will be expanded later)
 */
export default function Dashboard() {
  return (
    <div className="min-h-screen main-background p-6 md:p-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-xl bg-deep-twilight flex items-center justify-center">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" />
              <path d="M22 2 15 22 11 13 2 9l20-7Z" />
            </svg>
          </div>
          <h1 className="font-poppins text-2xl font-bold text-deep-twilight">Traveloop</h1>
        </div>

        <h2 className="font-poppins text-3xl md:text-4xl font-bold text-deep-twilight mb-2">
          Welcome back! 👋
        </h2>
        <p className="text-gray-500 text-lg mb-10">Here's what's happening with your travel plans.</p>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Total Trips', value: '12', icon: '✈️', color: 'from-bright-teal to-turquoise-surf' },
            { label: 'Budget Spent', value: '$18,450', icon: '💰', color: 'from-deep-twilight to-bright-teal' },
            { label: 'Distance', value: '34,000 KM', icon: '📍', color: 'from-turquoise-surf to-frosted-blue' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card flex items-center gap-5"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl shadow-soft`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                <p className="font-poppins text-2xl font-bold text-deep-twilight">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Placeholder cards */}
        <h3 className="font-poppins text-xl font-semibold text-deep-twilight mb-4">Recent Trips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Euro Summer Escape', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80', status: 'Current' },
            { title: 'Asian Adventure', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80', status: 'Upcoming' },
            { title: 'Dubai Getaway', img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', status: 'Completed' },
          ].map((trip, i) => (
            <motion.div
              key={trip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="glass-card p-0 overflow-hidden cursor-pointer group"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={trip.img}
                  alt={trip.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-center">
                  <h4 className="font-poppins font-semibold text-deep-twilight">{trip.title}</h4>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    trip.status === 'Current' ? 'bg-turquoise-surf/20 text-turquoise-surf' :
                    trip.status === 'Upcoming' ? 'bg-frosted-blue/40 text-bright-teal' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
