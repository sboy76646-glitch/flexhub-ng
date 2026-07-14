import { Navigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <section className="min-h-screen bg-slate-950 py-16">
        <div className="max-w-5xl mx-auto px-6">

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                  {user.firstName?.charAt(0)}
                  {user.lastName?.charAt(0)}
                </div>

                <div>
                  <h1 className="text-4xl font-bold text-white">
                    {user.name}
                  </h1>

                  <p className="text-gray-400 mt-2">
                    FlexHub NG Customer
                  </p>
                </div>
              </div>

              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition"
              >
                Logout
              </button>

            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-12">

              <div className="bg-slate-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">
                  First Name
                </p>

                <p className="text-white text-xl font-semibold mt-2">
                  {user.firstName}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">
                  Last Name
                </p>

                <p className="text-white text-xl font-semibold mt-2">
                  {user.lastName}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">
                  Email Address
                </p>

                <p className="text-white text-xl font-semibold mt-2 break-all">
                  {user.email}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6">
                <p className="text-gray-400 text-sm">
                  Phone Number
                </p>

                <p className="text-white text-xl font-semibold mt-2">
                  {user.phone}
                </p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 md:col-span-2">
                <p className="text-gray-400 text-sm">
                  Account Role
                </p>

                <p className="text-emerald-400 text-xl font-semibold mt-2 capitalize">
                  {user.role}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>
    </Layout>
  );
}

export default Profile; 