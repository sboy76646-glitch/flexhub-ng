import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({
  children,
  search = "",
  setSearch = () => {},
}) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar
        search={search}
        setSearch={setSearch}
      />

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  );
}

export default Layout; 