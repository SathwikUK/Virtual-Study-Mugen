import Navbar from "../components/Navbar";
import img from "../assets/vsmhome.png";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* Main container: make it relative & overflow-hidden so the glow doesn't produce scrollbars */}
      <div className="min-h-screen flex items-center justify-center bg-gray-1000 text-center px-8 md:px-16 no-scrollbar relative overflow-hidden">
        
        {/* Glow elements (purple blobs) */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-900 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-800 rounded-full blur-3xl opacity-40" />

        {/* Content wrapper: position above the glow (z-10) */}
        <div className="flex flex-col md:flex-row items-center w-full max-w-7xl z-10">
          {/* Left Div */}
          <div className="md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left space-y-6 mt-18">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-wide transform transition duration-500 hover:scale-105 hover:text-yellow-300 font-play mt-12">
              Welcome to Virtual Study Group
            </h1>
            <p className="text-white text-lg md:text-xl mt-4 max-w-md md:max-w-lg mx-auto md:mx-0 font-roboto">
              Collaborate with students, share notes, chat in real-time, and enhance your learning experience.
            </p>
            <div className="mt-6">
              <a
                href="/signup"
                className="
                  bg-gradient-to-r
                  from-purple-700
                  via-pink-500
                  to-pink-900
                  text-white
                  mt-4
                  px-8
                  py-3
                  rounded-lg
                  shadow-xl
                  transition
                  transform
                  hover:scale-110
                  hover:border-t-green-500
                  font-roboto
                  hover:text-white-500
                  hover:shadow-[0_0_10px_#fff,0_0_15px_#fff,0_0_25px_#fff]
                "
              >
                Get Started
              </a>
            </div>
          </div>

          {/* Right Div */}
          <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
            <img
              src={img}
              alt="Study Group"
              className="max-w-full h-auto rounded-lg shadow-2xl transition ml-20 mt-20 transform hover:scale-105"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
