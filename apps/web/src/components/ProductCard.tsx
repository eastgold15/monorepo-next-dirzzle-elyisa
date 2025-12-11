// import type React from "react";

// interface ProductCardProps {
//   product: Product;
//   aspectRatio?: string;
// }

// const ProductCard: React.FC<ProductCardProps> = ({
//   product,
//   aspectRatio = "aspect-[4/3]",
// }) => {
//   return (
//     <Link
//       className="group flex cursor-pointer flex-col items-center"
//       href={`/product/${product.id}`}
//     >
//       <div
//         className={`relative w-full ${aspectRatio} mb-6 overflow-hidden bg-gray-50/50`}
//       >
//         {/* Main Image */}
//         <img
//           alt={product.name}
//           className="absolute inset-0 h-full w-full transform object-contain opacity-100 mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
//           src={product.image}
//         />
//         {/* Hover Image (if available, otherwise keep main) */}
//         {product.additionalImages && product.additionalImages.length > 0 ? (
//           <img
//             alt={`${product.name} alternate`}
//             className="absolute inset-0 h-full w-full scale-105 transform object-contain opacity-0 mix-blend-multiply transition-all duration-700 group-hover:opacity-100"
//             src={product.additionalImages[0]}
//           />
//         ) : (
//           <img
//             alt={product.name}
//             className="absolute inset-0 h-full w-full scale-105 transform object-contain opacity-0 mix-blend-multiply transition-all duration-700 group-hover:opacity-100"
//             src={product.image}
//           />
//         )}

//         {product.isNew && (
//           <span className="absolute top-2 left-2 bg-black px-2 py-1 font-bold text-[8px] text-white uppercase tracking-widest">
//             New In
//           </span>
//         )}
//       </div>
//       <div className="text-center">
//         <h3 className="mb-1 font-serif text-black text-lg italic decoration-1 underline-offset-4 group-hover:underline md:text-xl">
//           {product.name}
//         </h3>
//         <p className="mb-2 font-serif text-gray-500 text-sm italic">
//           {product.subtitle}
//         </p>
//         <p className="font-bold text-xs tracking-widest">
//           USD {product.price.toLocaleString()}
//         </p>
//       </div>
//     </Link>
//   );
// };

// export default ProductCard;
