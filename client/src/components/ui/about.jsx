import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-sky-500 to-indigo-500 p-8">
      <div className="container mx-auto flex flex-col items-center justify-center text-center text-white space-y-8">
        <h1 className="text-5xl font-extrabold tracking-wide" style={{ fontFamily: 'Merriweather, serif' }}>
          About Raja Cold Press Oil Shops
        </h1>
        <p className="text-lg max-w-4xl">
          At Raja Cold Press Oil Shops, we are dedicated to providing our customers with the finest quality cold-pressed oils. Our oils are produced using traditional methods, ensuring they retain all their natural nutrients and flavors. Pure, natural, and healthy oils that promote a wholesome lifestyle—this is our promise to you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white text-black rounded-lg shadow-lg p-6 hover:transform hover:scale-105 transition duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-center">Our Mission</h2>
            <p>
              To empower individuals and families with the healthiest oil options, helping you embrace a natural and nutritious lifestyle.
            </p>
          </div>
          <div className="bg-white text-black rounded-lg shadow-lg p-6 hover:transform hover:scale-105 transition duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-center">Our Methods</h2>
            <p>
              We embrace age-old cold-pressing techniques to extract oils while maintaining their purity, flavor, and natural goodness.
            </p>
          </div>
          <div className="bg-white text-black rounded-lg shadow-lg p-6 hover:transform hover:scale-105 transition duration-300 ease-in-out">
            <h2 className="text-2xl font-bold text-center">Why Choose Us?</h2>
            <p>
              Because your health matters! Our oils are chemical-free, unrefined, and loaded with nutrients to benefit your body and mind.
            </p>
          </div>
        </div>
        <img 
          src="path/to/your/image.jpg" 
          alt="Cold Press Oil" 
          className="rounded-lg shadow-lg max-w-full h-auto transform hover:scale-105 transition duration-300 ease-in-out"
        />
        <div className="bg-white text-black rounded-lg shadow-lg p-6 max-w-3xl hover:transform hover:scale-105 transition duration-300 ease-in-out">
          <h2 className="text-2xl font-bold text-center">Our Promise</h2>
          <p>
            Raja Cold Press Oil Shops is committed to excellence. We ensure every drop of our oil embodies the purity, naturalness, and health that you and your family deserve.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
