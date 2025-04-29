export const registerFormControls = [
  {
    name: "userName",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addProductFormElements = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
      { id: "seeds", label: "Seeds" },
      { id: "oil", label: "Oil" },
      { id: "jaggery", label: "Jaggery" },
      { id: "nuts", label: "Nuts" },
      { id: "Ghee_oilcakes", label: "Ghee_oilcakes" },
    ],
  },
  {
    label: "Type",
    name: "brand",
    componentType: "input",
    type: "text",
    placeholder: "Enter product type (e.g., Urad Dal, Coconut Oil)",
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
  {
    label: "Sale Price",
    name: "salePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter sale price (optional)",
  },
  {
    label: "Total Stock",
    name: "totalStock",
    componentType: "input",
    type: "number",
    placeholder: "Enter total stock",
  },
];

export const shoppingViewHeaderMenuItems = [
  {
    id: "home",
    label: "Home",
    path: "/shop/home",
  },
  {
    id: "products",
    label: "Products",
    path: "/shop/listing",
  },
  {
    id: "oil",
    label: "Oil",
    path: "/shop/listing",
  },
  {
    id: "jaggery",
    label: "Jaggery",
    path: "/shop/listing",
  },
  {
    id: "nuts",
    label: "Nuts",
    path: "/shop/listing",
  },
  {
    id: "seeds",
    label: "Seeds",
    path: "/shop/listing",
  },
  {
    id: "Ghee_oil cakes",
    label: "ghee_oil cakes",
    path: "/shop/listing",
  },
  {
    id: "grinding-bookings",
    label: "Grinding Service",
    path: "/shop/grinding-bookings",
  },
  {
    id: "search",
    label: "Search",
    path: "/shop/search",
  },
];

export const categoryOptionsMap = {
  Seeds: "seeds",
  Jaggery: "jaggery",
  Oil: "oil",
  Ghee_oilcakes:"ghee_oilcakes",
  Nuts: "nuts",
};

export const brandOptionsMap = {
  "Coconut oil": "Coconut Oil",
  "Sesame oil": "Sesame Oil", 
  "Groundnut oil": "Groundnut Oil",
  "Castor oil": "Castor Oil",
  "woodpressed oil": "Wood-Pressed Oil",
  "Other": "Other Type",
  "urad dal": "Urad Dal",
  "channa dal": "Channa Dal",
  "moong dal": "Moong Dal",
  "toor dal": "Toor Dal",
  "palm jaggery": "Palm Jaggery",
  "jaggery powder": "Jaggery Powder",
  "Nutrien": "Premium Quality"
};

export const filterOptions = {
  category: [
    { id: "seeds", label: "Seeds" },
    { id: "oil", label: "Oil" },
    { id: "jaggery", label: "Jaggery" },
    { id: "nuts", label: "Nuts" },
    { id: "Ghee_oilcakes", label: "Ghee_oilcakes" },
  ]
};

export const sortOptions = [
  { id: "price-lowtohigh", label: "Price: Low to High" },
  { id: "price-hightolow", label: "Price: High to Low" },
  { id: "title-atoz", label: "Title: A to Z" },
  { id: "title-ztoa", label: "Title: Z to A" },
];

export const addressFormControls = [
  {
    label: "Address",
    name: "address",
    componentType: "input",
    type: "text",
    placeholder: "Enter your address",
  },
  {
    label: "City",
    name: "city",
    componentType: "input",
    type: "text",
    placeholder: "Enter your city",
  },
  {
    label: "Pincode",
    name: "pincode",
    componentType: "input",
    type: "text",
    placeholder: "Enter your pincode",
  },
  {
    label: "Phone",
    name: "phone",
    componentType: "input",
    type: "text",
    placeholder: "Enter your phone number",
  },
  {
    label: "Notes",
    name: "notes",
    componentType: "textarea",
    placeholder: "Enter any additional notes",
  },
];
