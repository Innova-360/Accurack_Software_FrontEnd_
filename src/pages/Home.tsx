import Topbar from "../components/TopBar.tsx";
import Cards from "../components/Cards.tsx";
import { useRequireStore } from "../hooks/useRequireStore";

function Home() {
  const currentStore = useRequireStore();

  // Show loading state while checking for store
  if (!currentStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store information...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar />
      <Cards />
    </div>
  );
}

export default Home;
