import { Button } from "@/components/ui/button";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
} from "lucide-react";
import { FaSeedling, FaOilCan, FaCandyCane, FaAppleAlt, FaCookieBite, FaLeaf, FaStar, FaCheckCircle, FaPhone, FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { addToWishlist, fetchWishlist } from "@/store/shop/wishlist-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import ShoppingHeader from "@/components/shopping-view/header";
import { Separator } from "@/components/ui/separator";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { motion } from "framer-motion";
import { IoExtensionPuzzleOutline, IoTimeOutline } from "react-icons/io5";
import { GiOilDrum, GiWoodBeam } from "react-icons/gi";
import { FiTruck } from "react-icons/fi";
import { CheckCircle, Star } from "lucide-react";

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 1,
    slidesToSlide: 1,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 1,
    slidesToSlide: 1,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1,
  },
};

const productResponsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 1600 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 1600, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 768 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 768, min: 480 },
    items: 2,
  },
  smallMobile: {
    breakpoint: { max: 480, min: 0 },
    items: 1,
  },
};

const TypeCard = ({ type, img, onClick }) => (
  <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-lg" onClick={onClick}>
    <div className="h-[200px] overflow-hidden">
      <img 
        src={img || "/assets/placeholder-oil.jpg"} 
        alt={type} 
        className="w-full h-full object-cover transition-transform hover:scale-105"
      />
    </div>
    <CardContent className="p-4">
      <h3 className="text-lg font-semibold text-center">{type}</h3>
    </CardContent>
  </Card>
);

function TestimonialCard({ testimonial }) {
  return (
    <Card className="p-4 h-full">
      <div className="flex flex-col h-full justify-between">
        <div>
          <div className="flex mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${i < (testimonial.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} 
              />
            ))}
          </div>
          <p className="italic text-gray-600 mb-4">"{testimonial.comment || 'Great product!'}"</p>
        </div>
        <div className="flex items-center mt-2">
          <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold">{testimonial.userName ? testimonial.userName[0].toUpperCase() : 'U'}</span>
          </div>
          <div>
            <p className="font-semibold">{testimonial.userName || 'User'}</p>
            <p className="text-sm text-gray-500">{testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { productList, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const categories = useSelector((state) => state.commonFeature.categories || []);
  const [testimonials] = useState([
    {
      _id: "1",
      userName: "Radha K.",
      comment: "I've been using their cold-pressed oils for years. The quality is unmatched!",
      rating: 5,
      createdAt: new Date()
    },
    {
      _id: "2",
      userName: "Aarav S.",
      comment: "The groundnut oil is exceptional - pure and aromatic. My family loves it!",
      rating: 5,
      createdAt: new Date()
    },
    {
      _id: "3",
      userName: "Meera P.",
      comment: "Their sesame oil has transformed my cooking. Fresh and authentic taste!",
      rating: 4,
      createdAt: new Date()
    }
  ]);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { wishlist } = useSelector((state) => state.shopWishlist);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const [oilTypes, setOilTypes] = useState([
    { type: "Coconut oil", img: "/assets/coconut-oil.jpg" },
    { type: "Sesame oil", img: "/assets/sesame-oil.jpg" },
    { type: "Groundnut oil", img: "/assets/groundnut-oil.jpg" },
    { type: "Castor oil", img: "/assets/castor-oil.jpg" },
    { type: "Wood Pressed oil", img: "/assets/wood-pressed-oil.jpg" },
  ]);

  const heroImages = [
    "/assets/hero1.jpg",
    "/assets/hero2.jpg",
    "/assets/hero3.jpg",
  ];

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function handleAddToWishlist(productId) {
    if (!user?.id) {
      toast({
        title: "Please log in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    // Check if product is already in wishlist
    const isInWishlist = wishlist?.products?.some(
      (item) => item.productId === productId
    );

    if (isInWishlist) {
      toast({
        title: "This item is already in your wishlist",
      });
      return;
    }

    dispatch(
      addToWishlist({
        userId: user.id,
        productId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchWishlist(user.id));
        toast({
          title: "Product added to wishlist",
        });
      }
    });
  }

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (featureImageList && featureImageList.length > 0) {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
      } else if (heroImages && heroImages.length > 0) {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % heroImages.length);
      }
    }, 8000);

    return () => clearInterval(timer);
  }, [featureImageList, heroImages]);

  useEffect(() => {
    dispatch(fetchAllFilteredProducts({ type: "all", value: "all" }));
    dispatch(getFeatureImages());

    // Fetch wishlist if user is logged in
    if (user?.id) {
      dispatch(fetchWishlist(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (productList && productList.length) {
      // Select featured products
      const featured = productList.filter((product) => 
        product && product.salePrice && product.totalStock > 0
      ).slice(0, 10);
      
      setFeaturedProducts(featured);
    }
  }, [productList]);

  function handleCategoryClick(categoryId) {
    sessionStorage.setItem(
      "filters",
      JSON.stringify({
        category: [categoryId],
      })
    );
    navigate("/shop/listing");
  }

  function handleTypeClick(type) {
    sessionStorage.setItem(
      "filters",
      JSON.stringify({
        type: [type],
      })
    );
    navigate("/shop/listing");
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative">
        <Carousel
          responsive={responsive}
          infinite={true}
          autoPlay={true}
          autoPlaySpeed={5000}
          className="z-0"
        >
          {featureImageList && featureImageList.length > 0 
            ? featureImageList.map((slide, index) => (
                <div key={slide._id || `slide-${index}`} className="relative h-[600px]">
                  <img
                    src={slide?.image}
                    alt={`Featured ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = heroImages[index % heroImages.length];
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                      Premium Cold Pressed Oils
                    </h1>
                    <p className="text-xl text-white mb-6 max-w-2xl drop-shadow-md">
                      Discover the pure taste of tradition with our wood-pressed oils, made the way nature intended
                    </p>
                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => navigate("/shop/listing")}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md text-lg"
                      >
                        Shop Now
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/shop/grinding-bookings")}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md border border-white"
                      >
                        Book Grinding Service
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            : heroImages.map((img, index) => (
                <div key={`hero-${index}`} className="relative h-[600px]">
                  <img
                    src={img}
                    alt={`Hero ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center px-4 text-center">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                      Premium Cold Pressed Oils
                    </h1>
                    <p className="text-xl text-white mb-6 max-w-2xl drop-shadow-md">
                      Discover the pure taste of tradition with our wood-pressed oils, made the way nature intended
                    </p>
                    <div className="flex space-x-4">
                      <Button 
                        onClick={() => navigate("/shop/listing")}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md text-lg"
                      >
                        Shop Now
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate("/shop/grinding-bookings")}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-md border border-white"
                      >
                        Book Grinding Service
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
        </Carousel>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50" id="about">
        <div className="container mx-auto px-4">
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

      {/* Categories Section */}
      <section className="py-16" id="products">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Shop by Category</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Explore our wide range of cold-pressed oils and natural products</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <Card
                  key={index}
                  onClick={() => handleCategoryClick(category._id || category.id)}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-teal-50 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                      <FaSeedling className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-bold text-gray-800">{category.name}</span>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback categories if data isn't available
              [
                { id: "seeds", name: "Seeds", icon: FaSeedling },
                { id: "oil", name: "Oils", icon: FaOilCan },
                { id: "jaggery", name: "Jaggery", icon: FaCandyCane },
                { id: "nuts", name: "Nuts", icon: FaAppleAlt },
                { id: "Ghee_oilcakes", name: "Ghee & Oil Cakes", icon: FaCookieBite }
              ].map((category, index) => (
                <Card
                  key={index}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 group-hover:bg-teal-50 transition-colors duration-300">
                    <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors duration-300">
                      <category.icon className="w-8 h-8 text-teal-600" />
                    </div>
                    <span className="font-bold text-gray-800">{category.name}</span>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Oil Types Section */}
     

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Customer Testimonials</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">See what our customers have to say about our products</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`${i < (testimonial.rating || 0) ? 'text-yellow-400' : 'text-gray-300'} w-5 h-5`} 
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.comment || 'Great product!'}"</p>
                  <p className="font-bold">{testimonial.userName || 'Customer'}</p>
                </div>
              ))
            ) : (
              // Fallback testimonials
              [
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
              ].map((testimonial, index) => (
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <Button
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
              onClick={() => navigate("/shop/listing")}
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <ShoppingProductTile
                  key={product._id} 
                  product={product} 
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                  handleAddToWishlist={handleAddToWishlist}
                  isInWishlist={wishlist?.products?.some(
                    (wishlistItem) => wishlistItem.productId === product._id
                  )}
                  isLoggedIn={!!user?.id}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500 py-8">
                No featured products available
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Grinding Services Section */}
      <section className="py-16 bg-gray-50" id="services">
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
                  onClick={() => navigate('/shop/grinding-bookings')}
                  className="mt-6 bg-white text-teal-600 hover:bg-gray-100"
                >
                  Book Grinding Service
                </Button>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">How It Works</h3>
                <ol className="space-y-4">
                  <li className="flex">
                    <div className="bg-teal-100 rounded-full w-8 h-8 flex items-center justify-center text-teal-600 font-bold mr-3">1</div>
                    <div>
                      <p className="text-gray-700">Go to the Grinding Bookings page</p>
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
      <section className="py-16 bg-teal-50" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-4">Visit Our Store</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="w-5 h-5 text-teal-600 mr-3 mt-1" />
                  <p className="text-gray-700">123 Market Street,Tamil Nadu , India</p>
                </div>
                <div className="flex items-center">
                  <FaPhone className="w-5 h-5 text-teal-600 mr-3" />
                  <p className="text-gray-700">+91 1234567890</p>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="w-5 h-5 text-teal-600 mr-3" />
                  <p className="text-gray-700">info@rajafoodproducts.com</p>
                </div>
                <div className="mt-6">
                  <h4 className="font-bold mb-2">Store Hours:</h4>
                  <p className="text-gray-700">Monday - Saturday: 9:00 AM - 8:00 PM</p>
                  <p className="text-gray-700">Sunday: 10:00 AM - 4:00 PM</p>
                </div>
              </div>
            </div>
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

export default ShoppingHome;
