import { filterOptions } from "@/config";
import { Fragment } from "react";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { TriangleRightIcon } from "lucide-react";

// Custom labels for filter categories
const getCategoryLabel = (key) => {
  if (key === "brand") return "Product Type";
  return key.charAt(0).toUpperCase() + key.slice(1);
};

function ProductFilter({ filters, handleFilter }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-teal-50 to-white">
        <h2 className="text-lg font-bold text-teal-800">Refine Results</h2>
      </div>
      
      <div className="p-4 space-y-5">
        {Object.keys(filterOptions).map((keyItem, index) => (
          <Fragment key={keyItem}>
            <div>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center">
                <TriangleRightIcon className="h-3 w-3 mr-1 text-teal-600" />
                {getCategoryLabel(keyItem)}
              </h3>
              
              <div className="grid gap-1.5 pl-1">
                {filterOptions[keyItem].map((option) => (
                  <Label 
                    key={option.id} 
                    className="flex items-center gap-2 py-1 cursor-pointer text-sm font-medium text-gray-700 hover:text-teal-700 transition-colors"
                  >
                    <Checkbox
                      checked={
                        filters &&
                        Object.keys(filters).length > 0 &&
                        filters[keyItem] &&
                        filters[keyItem].indexOf(option.id) > -1
                      }
                      onCheckedChange={() => handleFilter(keyItem, option.id)}
                      className="data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                    />
                    <span className="truncate">{option.label}</span>
                  </Label>
                ))}
              </div>
            </div>
            {index < Object.keys(filterOptions).length - 1 && (
              <Separator className="bg-gray-200" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductFilter;
