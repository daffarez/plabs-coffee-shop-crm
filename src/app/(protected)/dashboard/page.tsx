import Link from "next/link";

const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-xl font-bold">-</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">Top Interests</p>
          <p className="text-xl font-bold">-</p>
        </div>

        <div className="bg-white shadow p-4 rounded">
          <p className="text-sm text-gray-500">Suggested Campaign</p>
          <p className="text-xl font-bold">-</p>
        </div>
      </div>

      <Link
        href="/dashboard/customers"
        className="inline-block mt-4 bg-black text-white px-4 py-2 rounded"
      >
        Manage Customers
      </Link>
    </div>
  );
};

export default DashboardPage;
