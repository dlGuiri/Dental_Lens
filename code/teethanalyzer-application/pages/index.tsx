import Layout from "@/components/layout";
import HomeCard1 from "@/components/HomePage/cards/HomeCard1";
import HomeCard2 from "@/components/HomePage/cards/HomeCard2";
import HomeCard3 from "@/components/HomePage/cards/HomeCard3";
import HomeCard4 from "@/components/HomePage/cards/HomeCard4";
import HomeCard5 from "@/components/HomePage/cards/HomeCard5";

// ...and so on

const HomePage = () => {
  const userName = "User";
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 auto-rows-[30px]">
      <HomeCard1 className="md:col-span-9 md:row-span-10" metric={90}/>
      <HomeCard2 className="md:col-span-3 md:row-span-10" />
      <HomeCard3 className="md:col-span-6 md:row-span-8" />
      <HomeCard4 className="md:col-span-3 md:row-span-8" />
      <HomeCard5 className="md:col-span-3 md:row-span-8" />
    </div>
  );
};

export default HomePage;
