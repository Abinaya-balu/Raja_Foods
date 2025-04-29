import React from 'react';
import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import { FaSeedling, FaOilCan, FaCandyCane, FaAppleAlt, FaCookieBite, FaLeaf, FaStar, FaCheckCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import AuthLogin from '@/pages/auth/login';
import BookingForm from '@/components/ui/bookingforms';
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
  Menu,
  UserCircle,
  LogIn,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Link, useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { shoppingViewHeaderMenuItems } from "@/config";
import { Label } from "@/components/ui/label";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon },
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

function MenuItems() {
  const navigate = useNavigate();

  function handleNavigate(menuItem) {
    // For unauthenticated users, redirect to login except for home/about pages
    if (menuItem.id !== "home" && menuItem.path.startsWith("/shop/")) {
      navigate("/auth/login");
    } else if (menuItem.id === "home") {
      navigate("/");
    } else if (menuItem.id === "about") {
      // Scroll to about section
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menuItem.id === "products") {
      // Scroll to products section
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menuItem.id === "services") {
      // Scroll to services section
      const servicesSection = document.getElementById("services");
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (menuItem.id === "contact") {
      // Scroll to contact section
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // Simplified menu items for the home page
  const menuItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "products", label: "Products", path: "#products" },
    { id: "services", label: "Services", path: "#services" },
    { id: "about", label: "About", path: "#about" },
    { id: "contact", label: "Contact", path: "#contact" },
  ];

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {menuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
          key={menuItem.id}
        >
          {menuItem.label}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const navigate = useNavigate();

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4 text-black">
      <Button
        variant="outline"
        className="border-white text-white hover:bg-teal-700"
        onClick={() => navigate("/auth/login")}
      >
        <LogIn className="w-4 h-4 mr-2 text-black" />
        Sign In
      </Button>
      <Button
        variant="secondary"
        onClick={() => navigate("/auth/register")}
      >
        <UserCircle className="w-4 h-4 mr-2" />
        Register
      </Button>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-teal-600 text-zinc-50">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-bold text-zinc-50">SRI RAJA FOOD PRODUCTS</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden border-white text-white hover:bg-teal-700">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:block">
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    // For unauthenticated home page, redirect to login
    navigate("/auth/login");
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    // For unauthenticated users, redirect to login
    navigate("/auth/login");
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(
        (prevSlide) => (prevSlide + 1) % featureImageList.length
      );
    }, 8000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  const testimonials = [
    {
      name: "Radha K.",
      text: "I've been using their cold-pressed oils for years. The quality is unmatched and you can truly taste the difference!",
      rating: 5
    },
    {
      name: "Aarav S.",
      text: "The groundnut oil is exceptional - pure and aromatic. My family loves the traditional taste it brings to our cooking.",
      rating: 5
    },
    {
      name: "Meera P.",
      text: "Their sesame oil has transformed my cooking. It's fresh, authentic and reminds me of the oils my grandmother used to make.",
      rating: 4
    }
  ];

  // Categories matching the authenticated view
  const categories = [
    { id: "seeds", label: "Seeds", icon: FaSeedling },
    { id: "oil", label: "Oils", icon: FaOilCan },
    { id: "jaggery", label: "Jaggery", icon: FaCandyCane },
    { id: "nuts", label: "Nuts", icon: FaAppleAlt },
    { id: "Ghee_oilcakes", label: "Ghee/Oil Cakes", icon: FaCookieBite },
  ];

  // Types of oil matching the authenticated view
  const oilTypes = [
    { id: "Coconutoil", label: "Coconut oil" },
    { id: "Groundnutoil", label: "Groundnut oil" },
    { id: "Sesameoil", label: "Sesame oil" },
    { id: "Castoroil", label: "Castor oil" },
    { id: "Neemoil", label: "Neem oil" },
    { id: "woodpressedoil", label: "Wood pressed oil" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section with improved styling */}
      <div className="relative w-full h-[600px] overflow-hidden">
        {featureImageList && featureImageList.length > 0
          ? featureImageList.map((slide, index) => (
              <div 
                key={index}
                className={`${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                } absolute top-0 left-0 w-full h-full transition-opacity duration-1000`}
              >
                <img
                  src={slide?.image}
                  className="w-full h-full object-cover"
                  alt="Featured product"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-4 drop-shadow-lg">
                    Premium Cold Pressed Oils
                  </h1>
                  <p className="text-lg md:text-xl text-center max-w-2xl mb-8 drop-shadow-md">
                    Discover the pure taste of tradition with our wood-pressed oils, made the way nature intended
                  </p>
                  <div className="flex space-x-4">
                    <Button 
                      onClick={() => navigate('/auth/login')}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md font-medium"
                    >
                      Sign In to Shop
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/auth/login')}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-md font-medium border border-white"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))
          : null}
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) =>
                (prevSlide - 1 + featureImageList.length) %
                featureImageList.length
            )
          }
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() =>
            setCurrentSlide(
              (prevSlide) => (prevSlide + 1) % featureImageList.length
            )
          }
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white z-10"
        >
          <ChevronRightIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
        <h5 className="text-3xl  text-center mb-4 text-red-500">Test Environment Notice: This is a test deployment. All contact details, orders, and payments are simulated for testing purposes only. No real transactions or personal data are being processed.</h5>
          <h2 className="text-3xl font-bold text-center mb-4">Why Choose Us</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Our commitment to quality and tradition makes us the preferred choice for health-conscious customers</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                <FaLeaf className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">100% Natural</h3>
              <p className="text-gray-600">Our oils are extracted using traditional wood-pressed methods, preserving all natural nutrients and flavors.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                <FaCheckCircle className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Premium Quality</h3>
              <p className="text-gray-600">We source only the finest seeds and nuts, carefully selected to ensure superior taste and nutritional value.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                <FaStar className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Traditional Methods</h3>
              <p className="text-gray-600">Our cold-pressing process follows age-old techniques that preserve the authentic flavors and health benefits.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section with improved styling */}
      <section id="products" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Shop by Category</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Explore our wide range of cold-pressed oils and natural products</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((categoryItem, index) => (
              <Card
                key={index}
                onClick={() => handleNavigateToListingPage(categoryItem, "category")}
                className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-teal-50 transition-colors duration-300">
                  <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                    <categoryItem.icon className="w-8 h-8 text-teal-600" />
                  </div>
                  <span className="font-bold text-gray-800">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Customer Testimonials</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">See what our customers have to say about our products</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={`${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'} w-5 h-5`} 
                    />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-bold">{testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Featured Products</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Discover our most popular cold-pressed oils and natural products</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {productList && productList.length > 0
              ? productList.slice(0, 8).map((productItem, index) => (
                  <ShoppingProductTile
                    key={index}
                    handleGetProductDetails={handleGetProductDetails}
                    product={productItem}
                    handleAddtoCart={handleAddtoCart}
                  />
                ))
              : null}
          </div>
          
          {productList && productList.length > 8 && (
            <div className="text-center mt-12">
              <Button 
                onClick={() => navigate('/auth/login')}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md font-medium"
              >
                Sign In to View All Products
              </Button>
            </div>
          )}
        </div>
      </section>
      
      {/* Grinding Services Section */}
      <section id="services" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Grinding Services</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">We offer traditional grinding services for all your needs</p>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-teal-600 p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Our Grinding Service Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 mr-2 mt-1" />
                    <span>Traditional wood-pressed grinding methods</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 mr-2 mt-1" />
                    <span>Book your grinding slot in advance</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 mr-2 mt-1" />
                    <span>Multiple time slots available throughout the week</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 mr-2 mt-1" />
                    <span>Bring your own seeds or nuts for grinding</span>
                  </li>
                </ul>
                <Button
                  onClick={() => navigate('/auth/login')}
                  className="mt-6 bg-white text-teal-600 hover:bg-gray-100"
                >
                  Sign In to Book Grinding Service
                </Button>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center text-teal-600 font-bold mr-3">1</div>
                    <div>
                      <p className="text-gray-700">Sign in to your account</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center text-teal-600 font-bold mr-3">2</div>
                    <div>
                      <p className="text-gray-700">Select your preferred date from the calendar</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center text-teal-600 font-bold mr-3">3</div>
                    <div>
                      <p className="text-gray-700">Choose an available time slot that works for you</p>
                    </div>
                  </li>
                  <li className="flex">
                    <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center text-teal-600 font-bold mr-3">4</div>
                    <div>
                      <p className="text-gray-700">Confirm your booking and receive confirmation</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section id="about" className="py-16 bg-teal-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">About Sri Raja Food Products</h2>
              <p className="text-gray-700 mb-4">
                For over 25 years, Sri Raja Food Products has been dedicated to providing the highest quality cold-pressed oils using traditional wood-pressed methods.
              </p>
              <p className="text-gray-700 mb-4">
                Our commitment to preserving ancient techniques ensures that all our products retain their natural nutrients, flavors, and health benefits.
              </p>
              <p className="text-gray-700 mb-4">
                We source only the finest seeds and nuts from trusted local farmers, supporting sustainable agriculture and traditional farming practices.
              </p>
              <Button 
                onClick={() => {
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                  });
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md font-medium mt-4"
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Credit Section */}
      <section className="py-8 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Developed by <span className="font-semibold">Abinaya B T</span>
            </p>
            <p className="text-sm text-gray-600">
              M.Sc Software Systems Student
            </p>
            <p className="text-sm text-gray-600">
              Kongu Engineering College, Perundurai
            </p>
          </div>
        </div>
      </section>
      
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
      
   
    </div>
  );
}

export default Homepage;
