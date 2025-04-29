import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { makeAuthenticatedRequest } from "@/lib/api-helper";

function AdminFeatures() {
  const [featureImages, setFeatureImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch existing feature images
  const fetchFeatureImages = async () => {
    setLoading(true);
    try {
      const response = await makeAuthenticatedRequest("/common/feature/get");
      setFeatureImages(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load feature images",
        variant: "destructive",
      });
      console.error("Error fetching feature images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureImages();
  }, []);

  // Add a new feature image
  const handleAddImage = async (e) => {
    e.preventDefault();
    
    if (!newImageUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    try {
      await makeAuthenticatedRequest("/common/feature/add", "POST", {
        image: newImageUrl,
      });
      
      toast({
        title: "Success",
        description: "Feature image added successfully",
      });
      
      setNewImageUrl("");
      fetchFeatureImages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add feature image",
        variant: "destructive",
      });
      console.error("Error adding feature image:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete a feature image
  const handleDeleteImage = async (id) => {
    try {
      await makeAuthenticatedRequest(`/common/feature/delete/${id}`, "DELETE");
      
      toast({
        title: "Success",
        description: "Feature image deleted successfully",
      });
      
      // Update the state by removing the deleted image
      setFeatureImages(featureImages.filter(image => image._id !== id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feature image",
        variant: "destructive",
      });
      console.error("Error deleting feature image:", error);
    }
  };

  // Check if an image URL is valid
  const isValidImageUrl = (url) => {
    return /\.(jpeg|jpg|gif|png|webp)$/.test(url.toLowerCase());
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Feature Images</h1>
      </div>
      
      {/* Form to add a new feature image */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Add New Feature Image</h2>
          <form onSubmit={handleAddImage} className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="image-url" className="block text-sm font-medium mb-1">
                Image URL
              </label>
              <Input
                id="image-url"
                type="text"
                placeholder="https://example.com/image.jpg"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Image"}
            </Button>
          </form>
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Note: Images should be in landscape orientation (16:9 or 4:3 ratio) and at least 1200px wide for best results.
              Supported formats: JPG, PNG, GIF, WEBP.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview of current feature images */}
      <h2 className="text-xl font-semibold mb-4">Current Feature Images</h2>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading feature images...</p>
        </div>
      ) : featureImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No feature images found. Add some to display in the home page carousel.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureImages.map((image) => (
            <Card key={image._id} className="overflow-hidden">
              <div className="relative h-48 bg-gray-100">
                {isValidImageUrl(image.image) ? (
                  <img
                    src={image.image}
                    alt="Feature"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/400x225?text=Invalid+Image";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-200 text-gray-500">
                    Invalid image URL
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
                  onClick={() => handleDeleteImage(image._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-3">
                <p className="text-xs text-gray-500 truncate">{image.image}</p>
                <p className="text-xs text-gray-400">
                  Added: {new Date(image.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminFeatures;
