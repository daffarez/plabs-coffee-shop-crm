import TopNav from "@/src/components/topnav";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#FDFCF8]">
      <TopNav />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-10">{children}</main>
    </div>
  );
};

export default ProtectedLayout;
