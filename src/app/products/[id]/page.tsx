import { products } from '@/lib/data';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { ProductDetailClient } from '@/components/product-detail-client';

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

async function getProduct(id: string) {
    const product = products.find(p => p.id === id);
    return product;
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
            <ProductDetailClient product={product} />
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
