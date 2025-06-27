import { useStoreFromUrl } from "../hooks/useStoreFromUrl";
import Topbar from "../components/TopBar.tsx";
import Cards from "../components/Cards.tsx";
import Header from "../components/Header.tsx";

function Home() {
  const { loading } = useStoreFromUrl();

  // Show loading while fetching stores
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f4d57] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Topbar />
      <Cards />
    </div>
  )
}


export default Home
