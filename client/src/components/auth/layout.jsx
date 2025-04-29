import { Outlet } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaUtensils, FaLightbulb, FaHome, FaSeedling, FaHeart, FaBrain, FaOilCan } from "react-icons/fa";
import { GiOlive, GiCoconuts, GiPeanut, GiSesame } from "react-icons/gi";

function AuthLayout() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("benefits");

  const healthTips = [
    {
      title: "Coconut Oil",
      icon: <GiCoconuts className="text-4xl text-yellow-600" />,
      benefits: "Rich in medium-chain fatty acids, supports heart health, and boosts metabolism",
      tip: "Use for medium-heat cooking and as a natural moisturizer"
    },
    {
      title: "Sesame Oil",
      icon: <GiSesame className="text-4xl text-amber-700" />,
      benefits: "High in antioxidants, helps lower blood pressure, and improves skin health",
      tip: "Perfect for stir-fries and Asian cuisine, add at the end of cooking"
    },
    {
      title: "Groundnut Oil",
      icon: <GiPeanut className="text-4xl text-yellow-800" />,
      benefits: "Good source of vitamin E, lowers bad cholesterol, and contains resveratrol",
      tip: "Ideal for deep frying due to high smoke point and neutral flavor"
    },
    {
      title: "Olive Oil",
      icon: <GiOlive className="text-4xl text-green-600" />,
      benefits: "Contains heart-healthy monounsaturated fats and powerful antioxidants",
      tip: "Best used raw in salads and dressings to preserve its nutritional properties"
    }
  ];

  const recipes = [
    {
      title: "South Indian Coconut Chutney",
      oil: "Coconut Oil",
      description: "Blend fresh coconut, green chilies, ginger, and a tsp of cold-pressed coconut oil for an authentic taste",
      time: "10 mins"
    },
    {
      title: "Sesame Ginger Stir-Fry",
      oil: "Sesame Oil",
      description: "Stir-fry vegetables with ginger, garlic, and finish with a drizzle of cold-pressed sesame oil",
      time: "15 mins"
    },
    {
      title: "Traditional Peanut Chikki",
      oil: "Groundnut Oil",
      description: "Roast peanuts in cold-pressed groundnut oil, mix with jaggery for a healthy sweet treat",
      time: "30 mins"
    },
    {
      title: "Mediterranean Olive Salad",
      oil: "Olive Oil",
      description: "Mix fresh vegetables, feta cheese, and drizzle with cold-pressed olive oil and lemon juice",
      time: "5 mins"
    }
  ];
  
  const healthBenefits = [
    {
      title: "Heart Health",
      icon: <FaHeart className="text-red-500" />,
      description: "Cold-pressed oils retain natural antioxidants that protect your heart and improve circulation"
    },
    {
      title: "Brain Function",
      icon: <FaBrain className="text-pink-400" />,
      description: "Essential fatty acids in these oils support cognitive function and may reduce inflammation"
    },
    {
      title: "Digestive Health",
      icon: <FaSeedling className="text-green-500" />,
      description: "Natural cold-pressed oils help maintain a healthy gut microbiome and aid digestion"
    },
    {
      title: "Immunity Boost",
      icon: <FaLeaf className="text-green-600" />,
      description: "Rich in vitamins and minerals that strengthen your immune system naturally"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % healthTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <div className="hidden lg:flex flex-col items-center w-1/2 px-8 overflow-y-auto bg-gradient-to-br from-teal-700 to-teal-500 scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-gray-500 h-screen">
        <div className="max-w-md space-y-4 text-center text-white mb-4 pt-8">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Merriweather, serif' }}>
            Sri Raja Food Products
          </h1>
          <p className="text-lg font-light">Nature's Goodness, Traditionally Extracted</p>
        </div>
        
        <nav className="w-full flex justify-center space-x-2 text-base mb-6">
          <button 
            onClick={() => setActiveTab("benefits")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-300 ${activeTab === "benefits" ? "bg-white text-teal-700 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            <FaLeaf /> Benefits
          </button>
          <button 
            onClick={() => setActiveTab("recipes")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-300 ${activeTab === "recipes" ? "bg-white text-teal-700 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            <FaUtensils /> Recipes
          </button>
          <button 
            onClick={() => setActiveTab("tips")} 
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition duration-300 ${activeTab === "tips" ? "bg-white text-teal-700 shadow-lg" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            <FaLightbulb /> Tips
          </button>
          <a 
            href="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition duration-300"
          >
            <FaHome /> Home
          </a>
        </nav>
        
        {/* Highlight Section - Oil of the Day */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-amber-100 to-amber-50 p-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-teal-800">Oil of the Day</h2>
                <FaOilCan className="text-teal-600 text-2xl" />
              </div>
              
              <div className="mt-4 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {healthTips[currentSlide].icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-700">{healthTips[currentSlide].title}</h3>
                  <p className="text-sm text-gray-600">{healthTips[currentSlide].benefits}</p>
                  <p className="text-sm font-medium mt-2 text-amber-700">
                    <strong>Tip:</strong> {healthTips[currentSlide].tip}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center mt-4">
                {healthTips.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 mx-1 rounded-full ${currentSlide === index ? 'bg-teal-600' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tab Content */}
        <div className="w-full overflow-y-auto">
          {/* Benefits Tab */}
          {activeTab === "benefits" && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Health Benefits of Cold Pressed Oils</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {healthBenefits.map((benefit, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={index} 
                    className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-teal-50 rounded-full">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-teal-800">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-teal-800 mb-2">Why Cold Pressed?</h3>
                  <p className="text-gray-600 mb-2">
                    Unlike conventional methods, cold pressing:
                  </p>
                  <ul className="text-gray-600 list-disc pl-5 space-y-1">
                    <li>Uses no heat or chemicals, preserving nutrients</li>
                    <li>Maintains the natural aroma and flavor of the source seeds</li>
                    <li>Retains all the natural antioxidants and vitamins</li>
                    <li>Results in oils with lower free fatty acids</li>
              </ul>
            </div>
            </div>
            </motion.section>
          )}
          
          {/* Recipes Tab */}
          {activeTab === "recipes" && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Quick & Healthy Recipes</h2>
              
              <div className="grid grid-cols-1 gap-4">
                {recipes.map((recipe, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    key={index} 
                    className="bg-white bg-opacity-90 rounded-xl overflow-hidden shadow-lg"
                  >
                    <div className="border-l-4 border-amber-500">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-teal-800">{recipe.title}</h3>
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            {recipe.time}
                          </span>
    </div>
                        <p className="text-amber-700 text-sm font-medium mt-1">
                          Made with {recipe.oil}
                        </p>
                        <p className="text-gray-600 mt-2 text-sm">
                          {recipe.description}
                        </p>
    </div>
    </div>
                  </motion.div>
                ))}
                
                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-teal-800 flex items-center">
                    <FaUtensils className="mr-2 text-amber-600" /> 
                    Cooking Tips
                  </h3>
                  <ul className="text-gray-600 mt-2 space-y-2">
                    <li>
                      <span className="font-medium text-teal-700">Low Heat Cooking:</span> Use cold-pressed oils for low to medium heat cooking only
                    </li>
                    <li>
                      <span className="font-medium text-teal-700">For salads:</span> Mix with lemon juice and herbs for a delicious dressing
                    </li>
                    <li>
                      <span className="font-medium text-teal-700">Finishing touch:</span> Drizzle over completed dishes for added flavor
                    </li>
                  </ul>
    </div>
  </div>
            </motion.section>
          )}
          
          {/* Tips Tab */}
          {activeTab === "tips" && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-4">Expert Tips & Usage Guide</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-teal-800 mb-2">Proper Storage</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li className="flex items-start">
                      <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">1</span>
                      <span>Store in dark glass bottles away from direct sunlight</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">2</span>
                      <span>Keep in a cool place, ideally below 20°C (68°F)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">3</span>
                      <span>Seal tightly after each use to prevent oxidation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-amber-100 text-amber-800 w-6 h-6 rounded-full flex items-center justify-center mr-2 flex-shrink-0">4</span>
                      <span>Use within 3-6 months for optimal freshness and benefits</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-teal-800 mb-2">Health & Beauty Uses</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <h4 className="font-medium text-teal-700">Hair Mask</h4>
                      <p className="text-sm text-gray-600">
                        Warm coconut or sesame oil and massage into scalp. Leave for 30 minutes before washing.
                      </p>
                    </div>
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <h4 className="font-medium text-teal-700">Skin Moisturizer</h4>
                      <p className="text-sm text-gray-600">
                        Apply a few drops of olive or coconut oil to damp skin after showering.
                      </p>
                    </div>
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <h4 className="font-medium text-teal-700">Massage Oil</h4>
                      <p className="text-sm text-gray-600">
                        Mix sesame oil with a few drops of essential oil for a relaxing massage.
                      </p>
                    </div>
                    <div className="bg-teal-50 p-3 rounded-lg">
                      <h4 className="font-medium text-teal-700">Oil Pulling</h4>
                      <p className="text-sm text-gray-600">
                        Swish coconut oil in mouth for 15-20 minutes for oral health benefits.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
                  <h3 className="text-lg font-semibold text-teal-800 mb-2">Did You Know?</h3>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3">
                    <p className="text-gray-700 italic">
                      "Cold-pressed oils contain up to 30% more nutrients and antioxidants compared to refined oils, making them a powerful addition to your daily diet."
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-12 sm:px-6 lg:px-8 shadow-inner rounded-lg">
        <div className="w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
