import Link from 'next/link';
import { FiUsers, FiInbox, FiUploadCloud, FiLayers, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const options = [
    { href: "/all-claimants", title: "All Claimants", description: "View and manage all claimants in the system.", icon: FiUsers, color: "from-blue-400 to-blue-600" },
    { href: "/filing-queues", title: "Filing Queues", description: "Manage and process filing queues efficiently.", icon: FiInbox, color: "from-indigo-400 to-indigo-600" },
    { href: "/file-intake", title: "File Intake", description: "Upload and process new files and documents.", icon: FiUploadCloud, color: "from-purple-400 to-purple-600" },
    { href: "/playground", title: "Claim Ground", description: "Experiment with AI features and test new functionalities.", icon: FiLayers, color: "from-pink-400 to-pink-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <main className="relative container mx-auto px-4 py-20">
        <h1 className="text-7xl font-black mb-20 text-gray-800 text-center leading-tight">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">ClaimPoint</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {options.map((item, index) => (
            <Link key={index} href={item.href} className="group">
              <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center text-white`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <FiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors duration-300">{item.title}</h2>
                  <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
