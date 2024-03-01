import React, { useEffect } from "react";
import Navbar from "../../../../components/Navbar/Navbar";
import Details from "../../../../components/Details";
import ProductList from "../../../../components/ProductList"; // Add the import for ProductList
import { useProductContext } from "../../../../data/context/ProductContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../data/firebase/firebase.config";
import { useRouter } from "next/router";
import fetchPaintingData from "../../../../data/fetchPaintingData";
import paintingsMetadata from "../../../../data/paintingsMetadata.json";

export default function ProductPage({ paintingsData, productsStock }) {
  const router = useRouter();
  const { addToCart, setProducts, setStock } = useProductContext();

  const paintingindex = paintingsData.findIndex(
    (item) => item.label == decodeURIComponent(router.query.painting)
  );
  const foundPainting = paintingsData.find(
    (item) => item.label === router.query.painting
  );
  const foundStock = productsStock[paintingindex]?.stock || 0;
  const product = productData(foundPainting, paintingindex, foundStock);

  useEffect(() => {
    setProducts(paintingsData);
    setStock(productsStock);
  }, [paintingsData]);

  return (
    <div className="App">
      <Navbar />
      <Details product={product} addToCart={addToCart} />
    </div>
  );
}

export async function getServerSideProps() {
  const paintingsData = [];
  for (const painting of paintingsMetadata) {
    try {
      const response = await fetchPaintingData(painting.id);
      paintingsData.push(response);
    } catch (err) {
      console.error("Error at gssp fetchPaintingData" + err);
    }
  }

  const productsStock = [];
  const stockRef = collection(db, "paintings");
  const snapshot = await getDocs(stockRef);
  snapshot.forEach((doc) => {
    productsStock.push({ ...doc.data() });
  });

  return {
    props: {
      paintingsData: paintingsData,
      productsStock: productsStock,
    },
  };
}
