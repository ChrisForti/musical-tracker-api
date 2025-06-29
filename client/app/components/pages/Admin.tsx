export function Admin() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="bg-teal-600 text-white py-4 px-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </header>
      <main className="mt-6">
        <section className="bg-white shadow rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Manage Users</h2>
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            View Users
          </button>
        </section>
        <section className="bg-white shadow rounded p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Settings</h2>
          <button className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
            Update Settings
          </button>
        </section>
      </main>
    </div>
  );
}
