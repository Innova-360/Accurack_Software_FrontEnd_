import React, { useState, useEffect } from "react";

interface InventoryStatsProps {
  totalProducts: number;
  totalItems: number;
  totalValue: string;
}

// Custom hook for counter animation
const useCounterAnimation = (
  end: number,
  duration: number = 2000,
  delay: number = 0
) => {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      let startTime: number;
      const startValue = 0;
      const endValue = end;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(
          startValue + (endValue - startValue) * easeOutQuart
        );

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, delay]);

  return { count, isAnimating };
};

const InventoryStats: React.FC<InventoryStatsProps> = ({
  totalProducts,
  totalItems,
  totalValue,
}) => {
  // Animate the numbers with different delays
  const { count: animatedTotalProducts, isAnimating: isProductsAnimating } =
    useCounterAnimation(totalProducts, 2000, 200);
  const { count: animatedTotalItems, isAnimating: isItemsAnimating } =
    useCounterAnimation(totalItems, 2500, 400);

  // For the total value, we need to extract the numeric part and animate it
  const numericValue = parseFloat(totalValue.replace(/,/g, ""));
  const { count: animatedTotalValue, isAnimating: isValueAnimating } =
    useCounterAnimation(numericValue, 3000, 600);

  // Format the animated value back to the original format
  const formatAnimatedValue = (value: number) => {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {" "}
      {/* Total Products Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Products</p>{" "}
            <p
              className={`text-3xl font-bold text-gray-900 mt-2 number-counter ${isProductsAnimating ? "animating animate-numberGlow" : ""}`}
            >
              {animatedTotalProducts}
            </p>
            <p className="text-sm text-gray-500 mt-1">Unique product types</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors duration-300">
            <svg
              className="w-6 h-6 text-blue-600 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* Total Items Card */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp"
        style={{ animationDelay: "100ms" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Items</p>{" "}
            <p
              className={`text-3xl font-bold text-gray-900 mt-2 number-counter ${isItemsAnimating ? "animating animate-numberGlow" : ""}`}
            >
              {animatedTotalItems.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Items in stock</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full hover:bg-green-200 transition-colors duration-300">
            <svg
              className="w-6 h-6 text-green-600 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDelay: "200ms" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
              />
            </svg>
          </div>
        </div>
      </div>
      {/* Total Value Card */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105 animate-slideUp"
        style={{ animationDelay: "200ms" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Value</p>{" "}
            <p
              className={`text-3xl font-bold text-gray-900 mt-2 number-counter ${isValueAnimating ? "animating animate-numberGlow" : ""}`}
            >
              ${formatAnimatedValue(animatedTotalValue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total stock value</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full hover:bg-purple-200 transition-colors duration-300">
            <svg
              className="w-6 h-6 text-purple-600 "
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ animationDelay: "400ms" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryStats;
