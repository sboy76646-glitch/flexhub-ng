import Navbar from "./Navbar";
import Footer from "./Footer";
import UnifiedFlexAssistant from "../ai/UnifiedFlexAssistant";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1" tabIndex="-1">
        {children}
      </main>

      <Footer />
      <UnifiedFlexAssistant />
    </div>
  );
}

export default Layout;
